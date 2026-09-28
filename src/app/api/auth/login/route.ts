import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareEnv } from "@/lib/server/cloudflare";
import { hashPassword, safeEqual, startSession, verifyPassword } from "@/lib/server/auth";

const invalid = () => NextResponse.json({ error: "Invalid username or password." }, { status: 401 });

export async function POST(request: Request) {
	try {
		const { username, email, password } = (await request.json()) as Record<string, string>;
		const identifier = (username || email || "").trim();

		if (!identifier || !password) {
			return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
		}

		const cookieStore = await cookies();
		const env = await getCloudflareEnv();
		const { DB: db } = env;

		// 1. Super Admin login (credentials come from Worker secrets)
		const { SUPERADMIN_EMAIL: superAdminEmail, SUPERADMIN_PASSWORD: superAdminPassword } = env as unknown as Record<string, string | undefined>;
		if (
			superAdminEmail &&
			superAdminPassword &&
			identifier.toLowerCase() === superAdminEmail.toLowerCase() &&
			(await safeEqual(password, superAdminPassword))
		) {
			await startSession({ superAdminEmail });

			// Set default restaurant context if not already set
			if (!cookieStore.get("active_restaurant_id")?.value) {
				cookieStore.set("active_restaurant_id", "rest-demo", { path: "/" });
			}
			if (!cookieStore.get("active_branch_id")?.value) {
				cookieStore.set("active_branch_id", "branch-main", { path: "/" });
			}

			return NextResponse.json({ success: true, role: "admin" });
		}

		// 2. Staff User login (matches email or display name in staff_users table)
		const staff = await db
			.prepare("SELECT id, restaurant_id, email, role, password FROM staff_users WHERE (email = ? OR LOWER(display_name) = ?) AND status = 'active' ORDER BY created_at LIMIT 1")
			.bind(identifier.toLowerCase(), identifier.toLowerCase())
			.first<{ id: string; restaurant_id: string; email: string; role: string; password: string | null }>();

		// Accounts without a password can't sign in; an administrator has to set one first.
		const check = await verifyPassword(password, staff?.password);
		if (!staff || !check.ok) return invalid();

		if (check.needsRehash) {
			// Upgrade a legacy plain-text (or weaker) password now that we know it.
			await db.prepare("UPDATE staff_users SET password = ? WHERE email = ?").bind(await hashPassword(password), staff.email).run();
		}

		await startSession({ staffUserId: staff.id });

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
	} catch (err) {
		console.error("Login API error:", err);
		return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
	}
}
