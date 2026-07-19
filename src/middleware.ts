import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("auth_token")?.value;
	const host = request.headers.get("host") || "";
	const isAdminSubdomain = host.startsWith("admin-qrmenu.");

	// 1. Domain-specific routing
	if (isAdminSubdomain) {
		if (pathname === "/") {
			return NextResponse.redirect(new URL("/admin", request.url));
		}
	} else {
		// Enforce admin subdomain routing in production
		if (pathname.startsWith("/admin")) {
			const targetHost = "admin-qrmenu.fearlessonline.shop";
			if (!host.includes("localhost") && !host.includes("127.0.0.1") && host !== targetHost) {
				return NextResponse.redirect(new URL(pathname + request.nextUrl.search, `https://${targetHost}`));
			}
		}
	}

	// 2. Protect admin pages
	if (pathname.startsWith("/admin")) {
		if (!token) {
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("from", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}

	// 3. Protect admin API endpoints
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
		"/",
		"/admin/:path*",
		"/api/admin/:path*",
	],
};
