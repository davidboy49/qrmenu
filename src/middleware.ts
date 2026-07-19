import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("auth_token")?.value;

	// 1. Protect admin pages
	if (pathname.startsWith("/admin")) {
		if (!token) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}

	// 2. Protect admin API endpoints
	if (pathname.startsWith("/api/admin")) {
		if (!token) {
			return new NextResponse(
				JSON.stringify({ error: "Unauthorized. Please sign in." }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin/:path*",
		"/api/admin/:path*",
	],
};
