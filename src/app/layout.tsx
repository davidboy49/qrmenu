import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "QRMenu Admin",
		template: "%s | QRMenu",
	},
	description: "Manage restaurant menus, schedules, availability, and staff access.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
			</head>
			<body className="font-sans antialiased">
				<TooltipProvider>{children}</TooltipProvider>
			</body>
		</html>
	);
}
