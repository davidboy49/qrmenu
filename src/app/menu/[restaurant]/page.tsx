import { notFound } from "next/navigation";
import { listPublicMenu } from "@/lib/server/menu-repository";
import PublicMenuClient from "@/components/public-menu-client";
import { getSession } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function PublicMenuPage({
	params,
	searchParams,
}: {
	params: Promise<{ restaurant: string }>;
	searchParams: Promise<{ lang?: string; branch?: string }>;
}) {
	const { restaurant: slug } = await params;
	const { lang, branch } = await searchParams;
	const locale = lang === "en" ? "en" : "km-KH";

	const menu = await listPublicMenu(slug, locale, branch);
	if (!menu) notFound();

	const session = await getSession();
	const isAdmin = !!session;

	return <PublicMenuClient menu={menu} locale={locale} slug={slug} isAdmin={isAdmin} />;
}
