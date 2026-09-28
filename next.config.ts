import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
	images: {
		unoptimized: true,
	},
	async headers() {
		return [
			{
				// Ask Chromium browsers for the OS light/dark setting so the public menu's first
				// paint matches it (Critical-CH retries the very first request with the hint).
				source: "/menu/:path*",
				headers: [
					{ key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" },
					{ key: "Critical-CH", value: "Sec-CH-Prefers-Color-Scheme" },
					{ key: "Vary", value: "Sec-CH-Prefers-Color-Scheme" },
				],
			},
		];
	},
};

export default nextConfig;
