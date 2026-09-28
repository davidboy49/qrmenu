import { cache } from "react";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/server/cloudflare";

export const SESSION_COOKIE = "auth_token";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

// Workers caps PBKDF2 at 100,000 iterations.
const PBKDF2_ITERATIONS = 100_000;
const PASSWORD_PREFIX = "pbkdf2-sha256";

export type StaffRole = "owner" | "manager" | "editor" | "viewer";

export type Session = {
	role: "admin" | StaffRole;
	displayName: string;
	email: string;
	/** staff_users row for the restaurant this session is currently acting in (staff only). */
	staffUserId?: string;
	/** Every restaurant this person may access (staff only; super admins may access all). */
	restaurants?: { id: string; restaurant_id: string; name: string }[];
};

const now = () => Math.floor(Date.now() / 1000);
const encoder = new TextEncoder();

const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const toB64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (value: string) => new Uint8Array([...atob(value)].map((c) => c.charCodeAt(0)));

async function sha256Hex(value: string) {
	return toHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

/** Compares two strings without leaking where they differ through timing. */
export async function safeEqual(a: string, b: string) {
	const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
	let diff = 0;
	for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
	return diff === 0;
}

/* ─── Passwords ──────────────────────────────── */

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
	const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
	return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
}

export async function hashPassword(password: string) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
	return `${PASSWORD_PREFIX}$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export const isPasswordHash = (stored: string) => stored.startsWith(`${PASSWORD_PREFIX}$`);

/**
 * Checks a password against a stored value. Older rows hold plain text; those still verify,
 * and `needsRehash` tells the caller to replace them with a hash.
 */
export async function verifyPassword(password: string, stored: string | null | undefined) {
	if (!stored || !password) return { ok: false, needsRehash: false };
	if (!isPasswordHash(stored)) {
		return { ok: await safeEqual(password, stored), needsRehash: true };
	}
	const [, iterations, salt, expected] = stored.split("$");
	const actual = toB64(await pbkdf2(password, fromB64(salt), Number(iterations)));
	return { ok: await safeEqual(actual, expected), needsRehash: Number(iterations) !== PBKDF2_ITERATIONS };
}

/* ─── Sessions ───────────────────────────────── */

/** Creates a session row and sets the cookie. Pass exactly one of staffUserId / superAdminEmail. */
export async function startSession(owner: { staffUserId: string } | { superAdminEmail: string }) {
	const { DB: db } = await getCloudflareEnv();
	const token = toB64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]!);
	const t = now();
	await db.batch([
		db.prepare("DELETE FROM admin_sessions WHERE expires_at < ?").bind(t),
		db
			.prepare("INSERT INTO admin_sessions (token_hash, staff_user_id, super_admin_email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)")
			.bind(
				await sha256Hex(token),
				"staffUserId" in owner ? owner.staffUserId : null,
				"superAdminEmail" in owner ? owner.superAdminEmail : null,
				t,
				t + SESSION_TTL_SECONDS,
			),
	]);
	(await cookies()).set(SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_TTL_SECONDS,
	});
}

export async function endSession() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE)?.value;
	if (token) {
		const { DB: db } = await getCloudflareEnv();
		await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
	}
	cookieStore.delete(SESSION_COOKIE);
}

/** Points a staff session at another of the same person's staff_users rows (restaurant switch). */
export async function moveStaffSession(staffUserId: string) {
	const token = (await cookies()).get(SESSION_COOKIE)?.value;
	if (!token) return;
	const { DB: db } = await getCloudflareEnv();
	await db.prepare("UPDATE admin_sessions SET staff_user_id = ? WHERE token_hash = ? AND staff_user_id IS NOT NULL").bind(staffUserId, await sha256Hex(token)).run();
}

/** Resolves the signed-in user from the session cookie. Cached per request. */
export const readSession = cache(async (): Promise<Session | null> => {
	try {
		const token = (await cookies()).get(SESSION_COOKIE)?.value;
		if (!token) return null;
		const env = await getCloudflareEnv();
		const row = await env.DB
			.prepare("SELECT staff_user_id, super_admin_email FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
			.bind(await sha256Hex(token), now())
			.first<{ staff_user_id: string | null; super_admin_email: string | null }>();
		if (!row) return null;

		if (row.super_admin_email) {
			// The super admin is defined by env; if it was changed or removed, old sessions stop working.
			const configured = (env as unknown as Record<string, string | undefined>).SUPERADMIN_EMAIL;
			if (!configured || configured.toLowerCase() !== row.super_admin_email.toLowerCase()) return null;
			return { role: "admin", displayName: "Super Admin", email: row.super_admin_email };
		}

		const staff = await env.DB
			.prepare("SELECT id, email, display_name, role FROM staff_users WHERE id = ? AND status = 'active'")
			.bind(row.staff_user_id)
			.first<{ id: string; email: string; display_name: string; role: StaffRole }>();
		if (!staff) return null;

		const { results = [] } = await env.DB
			.prepare(
				`SELECT u.id, u.restaurant_id, r.name
				 FROM staff_users u
				 JOIN restaurants r ON r.id = u.restaurant_id
				 WHERE u.email = ? AND u.status = 'active'`,
			)
			.bind(staff.email)
			.all<{ id: string; restaurant_id: string; name: string }>();

		return { role: staff.role, displayName: staff.display_name, email: staff.email, staffUserId: staff.id, restaurants: results };
	} catch (e) {
		console.error("Failed to read session:", e);
		return null;
	}
});

/** True when the session may act in this restaurant. */
export const canAccessRestaurant = (session: Session, restaurantId: string) =>
	session.role === "admin" || !!session.restaurants?.some((r) => r.restaurant_id === restaurantId);

/**
 * Guard for /api/admin route handlers. Returns the session, or a 401/403 response to send back.
 * Viewers are read-only, so any method other than GET/HEAD is refused for them.
 */
export async function requireApiSession(request?: Request): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
	const session = await readSession();
	if (!session) return { error: NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 }) };
	const method = request?.method ?? "GET";
	if (session.role === "viewer" && method !== "GET" && method !== "HEAD") {
		return { error: NextResponse.json({ error: "Your role can only view this restaurant." }, { status: 403 }) };
	}
	return { session };
}
