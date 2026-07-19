"use client";

import Link from "next/link";
import { Search, Globe, Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { switchContext } from "@/app/admin/actions";

const breadcrumbLabels: Record<string, string> = {
	admin: "Admin",
	"menu-items": "Menu items",
	new: "Create new",
};

interface AdminHeaderProps {
	restaurantSlug?: string;
	activeRestaurantId?: string;
	restaurants?: any[];
	session?: any;
}

export function AdminHeader({
	restaurantSlug = "sabay-kitchen",
	activeRestaurantId,
	restaurants = [],
	session,
}: AdminHeaderProps) {
	const segments = usePathname().split("/").filter(Boolean);
	const [isPending, startTransition] = useTransition();
	const [customerMenuUrl, setCustomerMenuUrl] = useState(`/menu/${restaurantSlug}`);

	useEffect(() => {
		if (typeof window !== "undefined") {
			let origin = window.location.origin;
			if (window.location.hostname.startsWith("admin-qrmenu.")) {
				origin = origin.replace("admin-qrmenu.", "qrmenu.");
			}
			setCustomerMenuUrl(`${origin}/menu/${restaurantSlug}`);
		}
	}, [restaurantSlug]);

	const isSuperAdmin = session?.role === "admin";
	const availableRestaurants = isSuperAdmin
		? restaurants
		: (session?.restaurants || []).map((r: any) => ({ id: r.restaurant_id, name: r.name }));

	function handleSwitch(newRestaurantId: string) {
		startTransition(async () => {
			await switchContext(newRestaurantId);
			window.location.reload();
		});
	}

	return (
		<header className="sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
			<SidebarTrigger className="size-9" aria-label="Toggle navigation" />
			<Separator orientation="vertical" className="h-5" />
			<Breadcrumb className="min-w-0">
				<BreadcrumbList className="flex-nowrap">
					{segments.map((segment, index) => (
						<span className="contents" key={`${segment}-${index}`}>
							{index > 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								<BreadcrumbPage className="truncate">{breadcrumbLabels[segment] ?? segment}</BreadcrumbPage>
							</BreadcrumbItem>
						</span>
					))}
				</BreadcrumbList>
			</Breadcrumb>
			<Button variant="outline" className="hidden min-w-56 justify-start text-muted-foreground md:flex">
				<Search aria-hidden="true" />
				<span>Search anything...</span>
				<kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
			</Button>

			<div className="ml-auto flex items-center gap-2">
				{availableRestaurants.length > 1 && (
					<div className="flex items-center gap-1.5 border border-stone-250 rounded-lg px-2.5 h-8 bg-stone-50 text-stone-700 text-xs shadow-xs">
						<Building2 className="size-3.5 text-stone-500 shrink-0" />
						<select
							value={activeRestaurantId}
							disabled={isPending}
							onChange={(e) => handleSwitch(e.target.value)}
							className="font-semibold bg-transparent border-none outline-none cursor-pointer focus:ring-0 py-0 pr-6"
						>
							{availableRestaurants.map((r: any) => (
								<option key={r.id} value={r.id}>
									{r.name}
								</option>
							))}
						</select>
					</div>
				)}

				<Button
					variant="outline"
					nativeButton={false}
					render={<Link href={customerMenuUrl} />}
					className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold shrink-0"
				>
					<Globe className="size-3.5 text-stone-500" />
					<span>Customer View</span>
				</Button>
			</div>
		</header>
	);
}
