"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	CalendarClock,
	ChefHat,
	CircleGauge,
	History,
	ImageIcon,
	LayoutGrid,
	MapPin,
	QrCode,
	Settings,
	ShieldCheck,
	Tag,
	Users,
	UtensilsCrossed,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";

const navigationGroups = [
	{
		label: "Overview",
		items: [{ label: "Dashboard", href: "/admin", icon: CircleGauge }],
	},
	{
		label: "Menu management",
		items: [
			{ label: "Menu items", href: "/admin/menu-items", icon: UtensilsCrossed },
			{ label: "Categories", href: "/admin/categories", icon: LayoutGrid },
			{ label: "Media library", href: "/admin/media", icon: ImageIcon },
		],
	},
	{
		label: "Availability",
		items: [
			{ label: "Schedules", href: "/admin/schedules", icon: CalendarClock },
			{ label: "Special dates", href: "/admin/special-dates", icon: Tag },
			{ label: "Sold-out items", href: "/admin/sold-out", icon: ChefHat },
		],
	},
	{
		label: "Restaurant",
		items: [
			{ label: "Branches", href: "/admin/branches", icon: MapPin },
			{ label: "QR codes", href: "/admin/qr-codes", icon: QrCode },
			{ label: "Settings", href: "/admin/settings", icon: Settings },
		],
	},
	{
		label: "Access & security",
		items: [
			{ label: "Users", href: "/admin/users", icon: Users },
			{ label: "Roles", href: "/admin/roles", icon: ShieldCheck },
			{ label: "Audit log", href: "/admin/audit-log", icon: History },
		],
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="border-b p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							render={<Link href="/admin" aria-label="QRMenu administration" />}
							className="min-h-11"
						>
							<span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<UtensilsCrossed aria-hidden="true" />
							</span>
							<span className="grid flex-1 text-left leading-tight">
								<span className="font-semibold">QRMenu</span>
								<span className="text-xs text-muted-foreground">Restaurant admin</span>
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{navigationGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
									return (
										<SidebarMenuItem key={item.href}>
											<SidebarMenuButton
												render={<Link href={item.href} />}
												isActive={isActive}
												tooltip={item.label}
												className="min-h-10"
											>
												<item.icon aria-hidden="true" />
												<span>{item.label}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>

			<SidebarFooter className="border-t p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="min-h-11" tooltip="Sokha Dara">
							<Avatar className="size-8 rounded-lg">
								<AvatarFallback className="rounded-lg bg-primary/10 text-primary">SD</AvatarFallback>
							</Avatar>
							<span className="grid flex-1 text-left leading-tight">
								<span className="truncate font-medium">Sokha Dara</span>
								<span className="truncate text-xs text-muted-foreground">Owner</span>
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
