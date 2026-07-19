import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json() as Record<string, string>;

		if (email === "admin@qrmenu.com" && password === "admin") {
			const cookieStore = await cookies();
			cookieStore.set("auth_token", "demo-token-qrmenu-admin-success", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7, // 7 days
			});

			return NextResponse.json({ success: true });
		}

		return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
	} catch (err) {
		return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
	}
}
