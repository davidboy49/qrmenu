import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareEnv } from "@/lib/server/cloudflare";

export async function POST(request: Request) {
	try {
		const { username, email, password } = await request.json() as Record<string, string>;
		const identifier = username || email;

		if (!identifier) {
			return NextResponse.json({ error: "Username or email is required." }, { status: 400 });
		}

		const cookieStore = await cookies();

		// 1. Super Admin login
		if (identifier.toLowerCase() === "admin" && password === "Nor@45222") {
			cookieStore.set("auth_token", "demo-token-qrmenu-admin-success", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});

			// Set default restaurant context if not already set
			if (!cookieStore.get("active_restaurant_id")?.value) {
				cookieStore.set("active_restaurant_id", "rest-demo", { path: "/" });
			}
			if (!cookieStore.get("active_branch_id")?.value) {
				cookieStore.set("active_branch_id", "branch-main", { path: "/" });
			}

			return NextResponse.json({ success: true, role: "admin" });
		}

		// 2. Staff User login (matches email in staff_users table)
		const { DB: db } = await getCloudflareEnv();
		const staff = await db
			.prepare("SELECT id, restaurant_id, email, display_name, role FROM staff_users WHERE email = ? AND status = 'active'")
			.bind(identifier.toLowerCase())
			.first<{
				id: string;
				restaurant_id: string;
				email: string;
				display_name: string;
				role: string;
			}>();

		if (staff) {
			cookieStore.set("auth_token", `staff-token-${staff.id}`, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});

			cookieStore.set("active_restaurant_id", staff.restaurant_id, {
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});

			// Resolve the first branch of the restaurant
			const branch = await db
				.prepare("SELECT id FROM branches WHERE restaurant_id = ? ORDER BY id LIMIT 1")
				.bind(staff.restaurant_id)
				.first<{ id: string }>();

			cookieStore.set("active_branch_id", branch?.id || "branch-main", {
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});

			return NextResponse.json({ success: true, role: staff.role });
		}

		return NextResponse.json({ error: "Invalid credentials or user is not active." }, { status: 401 });
	} catch (err) {
		console.error("Login API error:", err);
		return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
	}
}
