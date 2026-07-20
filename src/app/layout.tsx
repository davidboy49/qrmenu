import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "QR Menu | Elegant Digital Menus for Restaurants",
		template: "%s | QR Menu",
	},
	description: "Create premium, responsive QR menus for your restaurant. Support for English & Khmer, real-time pricing updates, and high-end typography.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+Khmer:wght@300;400;500;600;700&family=Noto+Sans+Khmer:wght@300;400;500;600;700&family=Kantumruy+Pro:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet" />
			</head>
			<body className="font-sans antialiased">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
