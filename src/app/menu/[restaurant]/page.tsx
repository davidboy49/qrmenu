import { notFound } from "next/navigation";
import { listPublicMenu } from "@/lib/server/menu-repository";
import PublicMenuClient from "@/components/public-menu-client";

export const dynamic = "force-dynamic";

export default async function PublicMenuPage({
	params,
	searchParams,
}: {
	params: Promise<{ restaurant: string }>;
	searchParams: Promise<{ lang?: string }>;
}) {
	const { restaurant: slug } = await params;
	const { lang } = await searchParams;
	const locale = lang === "en" ? "en" : "km-KH";

	const menu = await listPublicMenu(slug, locale);
	if (!menu) notFound();

	return <PublicMenuClient menu={menu} locale={locale} slug={slug} />;
}

