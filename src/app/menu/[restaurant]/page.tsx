import { cache } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { listPublicMenu } from "@/lib/server/menu-repository";
import PublicMenuClient from "@/components/public-menu-client";
import { getSession } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

type Params = Promise<{ restaurant: string }>;
type SearchParams = Promise<{ lang?: string; branch?: string }>;

// Shared by generateMetadata and the page so the menu is queried once per request.
const getMenu = cache(listPublicMenu);

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
	const { restaurant: slug } = await params;
	const { lang, branch } = await searchParams;
	const isEn = lang === "en";
	const menu = await getMenu(slug, isEn ? "en" : "km-KH", branch);
	if (!menu) return { title: isEn ? "Menu not found" : "រកមិនឃើញម៉ឺនុយ" };

	const title = `${menu.restaurant} · ${isEn ? "Menu" : "ម៉ឺនុយ"}`;
	const description = isEn
		? `Browse the ${menu.restaurant} menu (${menu.branchName}) in Khmer and English, with prices in USD and KHR.`
		: `មើលម៉ឺនុយ ${menu.restaurant} (${menu.branchName}) ជាភាសាខ្មែរ និងអង់គ្លេស ជាមួយតម្លៃជាដុល្លារ និងរៀល។`;
	const logo = menu.logoId ? `/api/media/${menu.logoId}` : null;
	const shareImageId = menu.carousel?.[0] ?? menu.logoId;

	return {
		title: { absolute: title },
		description,
		icons: logo ? { icon: logo, apple: logo } : undefined,
		openGraph: {
			type: "website",
			title,
			description,
			siteName: menu.restaurant,
			locale: isEn ? "en_US" : "km_KH",
			images: shareImageId ? [`/api/media/${shareImageId}`] : undefined,
		},
	};
}

// Resolve the theme on the server so the first paint already matches the guest's choice.
// Order: saved choice (cookie) → OS preference via the Sec-CH-Prefers-Color-Scheme client hint
// (Chromium; requested in next.config.ts) → dark. The client corrects and saves it if needed.
async function getInitialTheme(): Promise<{ theme: "dark" | "light"; known: boolean }> {
	const saved = (await cookies()).get("menu-theme")?.value;
	if (saved === "dark" || saved === "light") return { theme: saved, known: true };
	const hint = (await headers()).get("sec-ch-prefers-color-scheme");
	if (hint === "dark" || hint === "light") return { theme: hint, known: true };
	return { theme: "dark", known: false };
}

export default async function PublicMenuPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
	const { restaurant: slug } = await params;
	const { lang, branch } = await searchParams;
	const locale = lang === "en" ? "en" : "km-KH";

	const menu = await getMenu(slug, locale, branch);
	if (!menu) notFound();

	const session = await getSession();
	const isAdmin = !!session;
	const { theme, known } = await getInitialTheme();

	return (
		<PublicMenuClient
			menu={menu}
			locale={locale}
			slug={slug}
			isAdmin={isAdmin}
			initialTheme={theme}
			themeKnown={known}
		/>
	);
}
