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
	LogOut,
	MapPin,
	QrCode,
	Settings,
	ShieldCheck,
	Tag,
	Users,
	UtensilsCrossed,
	Building2,
	GitBranch,
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
			{ label: "Roles", href: "/admin/roles", icon: ShieldCheck },
			{ label: "Audit log", href: "/admin/audit-log", icon: History },
		],
	},
];

interface AppSidebarProps {
	session: {
		role: string;
		displayName: string;
		email: string;
		restaurants?: any[];
	} | null;
	activeContext: {
		restaurantId: string;
		branchId: string;
		restaurantName: string;
		restaurantSlug: string;
		branchName: string;
		branchSlug: string;
	};
}

export function AppSidebar({
	session,
	activeContext,
}: AppSidebarProps) {
	const pathname = usePathname();

	const isSuperAdmin = session?.role === "admin";

	// Determine sidebar navigation groups based on role
	const currentGroups = isSuperAdmin
		? [
				{
					label: "Master Realm",
					items: [
						{ label: "Restaurants & Branches", href: "/admin/restaurants", icon: Building2 },
						{ label: "User Management", href: "/admin/users", icon: Users },
					],
				},
				...navigationGroups,
		  ]
		: navigationGroups;

	const displayName = session?.displayName || "Sokha Dara";
	const roleLabel = session?.role
		? session.role.charAt(0).toUpperCase() + session.role.slice(1)
		: "Owner";
	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="border-b p-3">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center gap-2 px-1.5 py-1">
							<span className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shrink-0">
								<UtensilsCrossed className="size-5" />
							</span>
							<div className="grid flex-1 text-left leading-tight">
								<span className="font-bold text-stone-900 truncate text-sm">
									{activeContext.restaurantName}
								</span>
								<span className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
									<GitBranch className="size-3 text-stone-400" />
									{activeContext.branchName}
								</span>
							</div>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				{currentGroups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => {
									const isActive =
										item.href === "/admin"
											? pathname === item.href
											: pathname.startsWith(item.href);
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
						<div className="flex items-center justify-between gap-1 w-full group-data-[collapsible=icon]:flex-col">
							<SidebarMenuButton
								size="lg"
								className="min-h-11 flex-1 pointer-events-none"
								tooltip={displayName}
							>
								<Avatar className="size-8 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary/10 text-primary">
										{initials}
									</AvatarFallback>
								</Avatar>
								<span className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
									<span className="truncate font-medium">{displayName}</span>
									<span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
								</span>
							</SidebarMenuButton>
							<button
								onClick={async () => {
									if (confirm("Are you sure you want to sign out?")) {
										const res = await fetch("/api/auth/logout", { method: "POST" });
										if (res.ok) {
											window.location.href = "/login";
										}
									}
								}}
								className="flex size-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 active:scale-95 transition-all shrink-0"
								title="Sign out"
							>
								<LogOut className="size-4" />
							</button>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
