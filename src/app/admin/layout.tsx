import { AdminHeader } from "@/components/admin/admin-header";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
	getSession,
	getActiveContextDetails,
	getRestaurantsList,
	getBranchesList,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	const session = await getSession();
	const activeContext = await getActiveContextDetails();

	let restaurants: any[] = [];
	let branches: any[] = [];

	if (session?.role === "admin") {
		// Load restaurants list for Super Admin switching in Header
		restaurants = await getRestaurantsList();
		branches = await getBranchesList(activeContext.restaurantId);
	} else if (session && session.restaurants && session.restaurants.length > 1) {
		// Pass accessible restaurants to multi-tenant staff members
		restaurants = session.restaurants;
	}

	return (
		<QueryProvider>
			<SidebarProvider>
				<AppSidebar
					session={session}
					activeContext={activeContext}
				/>
				<SidebarInset>
					<AdminHeader 
						restaurantSlug={activeContext.restaurantSlug} 
						activeRestaurantId={activeContext.restaurantId}
						restaurants={restaurants}
						session={session}
					/>
					{children}
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	);
}
