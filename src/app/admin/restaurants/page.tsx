import { redirect } from "next/navigation";
import { getSession } from "../actions";
import { listRestaurants } from "@/lib/server/menu-repository";
import RestaurantsClient from "./restaurants-client";

export const dynamic = "force-dynamic";

export default async function RestaurantsPage() {
	const session = await getSession();
	
	// Enforce Super Admin (Master Realm) access only
	if (session?.role !== "admin") {
		redirect("/admin/menu-items");
	}

	const restaurants = await listRestaurants();

	return <RestaurantsClient initialRestaurants={restaurants} />;
}
