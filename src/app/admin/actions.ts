"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCloudflareEnv } from "@/lib/server/cloudflare";
import {
	getRestaurantContextId,
	getBranchContextId,
	listRestaurants,
	listBranches,
	createRestaurant,
	createBranch,
	updateBranch,
	createStaffUserWithPassword,
	deleteStaffUser,
	updateStaffUserStatus,
	copyRestaurantStructure,
	copyBranchContext,
} from "@/lib/server/menu-repository";

export async function getSession() {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("auth_token")?.value;
		if (!token) return null;

		if (token.startsWith("demo-token-qrmenu-admin-success")) {
			const email = token.includes(":") ? token.split(":")[1] : "admin";
			return { role: "admin", displayName: "Super Admin", email: email };
		}

		if (token.startsWith("staff-token-")) {
			const staffId = token.replace("staff-token-", "");
			const { DB: db } = await getCloudflareEnv();
			const staff = await db
				.prepare("SELECT email, display_name, role FROM staff_users WHERE id = ?")
				.bind(staffId)
				.first<{ email: string; display_name: string; role: string }>();

			if (staff) {
				const mappings = await db.prepare(
					`SELECT u.id, u.restaurant_id, r.name 
					 FROM staff_users u
					 JOIN restaurants r ON r.id = u.restaurant_id
					 WHERE u.email = ? AND u.status = 'active'`
				).bind(staff.email).all<{ id: string; restaurant_id: string; name: string }>();

				return {
					role: staff.role,
					displayName: staff.display_name,
					email: staff.email,
					restaurants: mappings.results || [],
				};
			}
		}
	} catch (e) {
		console.error("Failed to get session:", e);
	}
	return null;
}

export async function isSuperAdmin(): Promise<boolean> {
	const session = await getSession();
	return session?.role === "admin";
}

export async function getActiveContextDetails() {
	const restaurantId = await getRestaurantContextId();
	const branchId = await getBranchContextId();
	const { DB: db } = await getCloudflareEnv();

	const restaurant = await db
		.prepare("SELECT name, slug FROM restaurants WHERE id = ?")
		.bind(restaurantId)
		.first<{ name: string; slug: string }>();

	const branch = await db
		.prepare("SELECT name, slug FROM branches WHERE id = ?")
		.bind(branchId)
		.first<{ name: string; slug: string }>();

	return {
		restaurantId,
		branchId,
		restaurantName: restaurant?.name || "Sabay Kitchen",
		restaurantSlug: restaurant?.slug || "sabay-kitchen",
		branchName: branch?.name || "Main Branch",
		branchSlug: branch?.slug || "main",
	};
}

export async function switchContext(restaurantId: string, branchId?: string) {
	const cookieStore = await cookies();
	cookieStore.set("active_restaurant_id", restaurantId, { path: "/" });

	const session = await getSession();
	if (session && session.role !== "admin" && session.restaurants) {
		const mapping = session.restaurants.find((r: any) => r.restaurant_id === restaurantId);
		if (mapping) {
			cookieStore.set("auth_token", `staff-token-${mapping.id}`, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});
		}
	}

	if (branchId) {
		cookieStore.set("active_branch_id", branchId, { path: "/" });
	} else {
		// Fallback to the first branch of the selected restaurant
		const { DB: db } = await getCloudflareEnv();
		const branch = await db
			.prepare("SELECT id FROM branches WHERE restaurant_id = ? ORDER BY id LIMIT 1")
			.bind(restaurantId)
			.first<{ id: string }>();

		cookieStore.set("active_branch_id", branch?.id || "branch-main", { path: "/" });
	}

	revalidatePath("/admin");
}

export async function getRestaurantsList() {
	return await listRestaurants();
}

export async function getBranchesList(restaurantId: string) {
	return await listBranches(restaurantId);
}

export async function createRestaurantAction(input: {
	name: string;
	slug: string;
	timezone?: string;
	defaultLocale?: string;
	copyOfRestaurantId?: string;
}) {
	const session = await getSession();
	if (session?.role !== "admin") {
		throw new Error("Unauthorized");
	}
	const result = await createRestaurant({
		name: input.name,
		slug: input.slug,
		timezone: input.timezone,
		defaultLocale: input.defaultLocale,
	});

	if (input.copyOfRestaurantId) {
		try {
			await copyRestaurantStructure(input.copyOfRestaurantId, result.id, result.defaultBranchId);
		} catch (e) {
			console.error("Failed to copy structure:", e);
		}
	}

	revalidatePath("/admin/restaurants");
	return result;
}

export async function createBranchAction(restaurantId: string, input: {
	name: string;
	slug: string;
	timezone?: string;
}) {
	const session = await getSession();
	if (session?.role !== "admin") {
		throw new Error("Unauthorized");
	}
	const result = await createBranch(restaurantId, input);
	revalidatePath("/admin/restaurants");
	return result;
}

export async function createStaffUserAction(input: {
	email: string;
	displayName: string;
	role: "owner" | "manager" | "editor" | "viewer";
	restaurantIds: string[];
	password?: string;
}) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	const result = await createStaffUserWithPassword(input);
	revalidatePath("/admin/users");
	return result;
}

export async function deleteStaffUserAction(userId: string) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	await deleteStaffUser(userId);
	revalidatePath("/admin/users");
}

export async function updateStaffUserStatusAction(userId: string, status: string) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	await updateStaffUserStatus(userId, status);
	revalidatePath("/admin/users");
}

export async function copyMenuStructureAction(input: {
	sourceRestaurantId: string;
	targetRestaurantId: string;
}) {
	const session = await getSession();
	if (session?.role !== "admin") {
		throw new Error("Unauthorized");
	}

	const { DB: db } = await getCloudflareEnv();

	// Find the first branch of the target restaurant
	const branch = await db
		.prepare("SELECT id FROM branches WHERE restaurant_id = ? ORDER BY id LIMIT 1")
		.bind(input.targetRestaurantId)
		.first<{ id: string }>();

	if (!branch) {
		throw new Error("Target restaurant does not have any branches.");
	}

	await copyRestaurantStructure(input.sourceRestaurantId, input.targetRestaurantId, branch.id);
	revalidatePath("/admin/restaurants");
	return { success: true };
}

export async function copyBranchContextAction(input: {
	sourceBranchId: string;
	targetBranchId: string;
}) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	await copyBranchContext(input.sourceBranchId, input.targetBranchId);
	revalidatePath("/admin/branches");
	return { success: true };
}

export async function updateBranchAction(branchId: string, input: {
	name: string;
	slug: string;
	timezone?: string;
}) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	const result = await updateBranch(branchId, input);
	revalidatePath("/admin/branches");
	revalidatePath("/admin/restaurants");
	return result;
}
