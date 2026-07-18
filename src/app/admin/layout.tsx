import { AdminHeader } from "@/components/admin/admin-header";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<QueryProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<AdminHeader />
					{children}
				</SidebarInset>
			</SidebarProvider>
		</QueryProvider>
	);
}
