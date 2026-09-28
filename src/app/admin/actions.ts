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
	updateBranchWifi,
	createStaffUserWithPassword,
	deleteStaffUser,
	updateStaffUserStatus,
	copyRestaurantStructure,
	copyBranchContext,
	updateRestaurant,
} from "@/lib/server/menu-repository";
import { canAccessRestaurant, moveStaffSession, readSession } from "@/lib/server/auth";
import { z } from "zod";

export async function getSession() {
	return readSession();
}

export async function isSuperAdmin(): Promise<boolean> {
	const session = await getSession();
	return session?.role === "admin";
}

export async function getActiveContextDetails() {
	if (!(await getSession())) throw new Error("Unauthorized");
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
	const session = await getSession();
	if (!session || !canAccessRestaurant(session, restaurantId)) {
		throw new Error("Unauthorized");
	}

	const cookieStore = await cookies();
	cookieStore.set("active_restaurant_id", restaurantId, { path: "/" });

	if (session.role !== "admin") {
		// Staff have one staff_users row per restaurant; act as the row for the new restaurant.
		const mapping = session.restaurants?.find((r) => r.restaurant_id === restaurantId);
		if (mapping) await moveStaffSession(mapping.id);
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
	if (!(await isSuperAdmin())) throw new Error("Unauthorized");
	return await listRestaurants();
}

export async function getBranchesList(restaurantId: string) {
	const session = await getSession();
	if (!session || !canAccessRestaurant(session, restaurantId)) throw new Error("Unauthorized");
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

const wifiSchema = z
	.object({
		enabled: z.boolean(),
		ssid: z.string().trim().max(32, "Network name can be at most 32 characters."),
		password: z.string().max(63, "Password can be at most 63 characters."),
		security: z.enum(["WPA", "WEP", "nopass"]),
	})
	.superRefine((v, ctx) => {
		if (!v.enabled) return;
		if (!v.ssid) ctx.addIssue({ code: "custom", message: "Enter the network name to show Wi-Fi on the menu." });
		if (v.security === "WPA" && v.password.length < 8)
			ctx.addIssue({ code: "custom", message: "A WPA password needs at least 8 characters." });
		if (v.security === "WEP" && !v.password) ctx.addIssue({ code: "custom", message: "Enter the Wi-Fi password." });
	});

export async function updateBranchWifiAction(branchId: string, input: z.input<typeof wifiSchema>) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	const parsed = wifiSchema.safeParse(input);
	if (!parsed.success) {
		throw new Error(parsed.error.issues[0]?.message ?? "Invalid Wi-Fi settings.");
	}
	const restaurantId = await getRestaurantContextId();
	const { enabled, ssid, password, security } = parsed.data;
	const updated = await updateBranchWifi(restaurantId, branchId, {
		enabled,
		ssid: ssid || null,
		password: password || null,
		security,
	});
	if (!updated) {
		throw new Error("Branch not found.");
	}
	revalidatePath("/admin/branches");
}

export async function getRestaurantDetails(restaurantId: string) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	const { DB: db } = await getCloudflareEnv();
	const restaurant = await db
		.prepare("SELECT id, name, slug, timezone, default_locale as defaultLocale, logo_asset_id as logoAssetId FROM restaurants WHERE id = ?")
		.bind(restaurantId)
		.first<{ id: string; name: string; slug: string; timezone: string; defaultLocale: string; logoAssetId: string | null }>();
	
	if (!restaurant) {
		throw new Error("Restaurant not found");
	}
	return restaurant;
}

export async function updateRestaurantAction(restaurantId: string, input: {
	name: string;
	timezone: string;
	defaultLocale: string;
	logoAssetId?: string | null;
}) {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	
	// Only allow super admin or authorized staff
	if (session.role !== "admin") {
		const isAuthorized = session.restaurants?.some((r: any) => r.restaurant_id === restaurantId);
		if (!isAuthorized) {
			throw new Error("Unauthorized");
		}
	}

	const result = await updateRestaurant(restaurantId, input);
	revalidatePath("/admin/settings");
	revalidatePath("/admin");
	return result;
}
