"use client";

import Link from "next/link";
import { Globe, Building2 } from "lucide-react";
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

function formatSegment(segment: string) {
	// Record IDs (UUIDs, generated slugs) are not meaningful in a breadcrumb.
	if (/^[0-9a-f-]{16,}$/i.test(segment)) return "Edit";
	const words = decodeURIComponent(segment).replace(/-/g, " ");
	return words.charAt(0).toUpperCase() + words.slice(1);
}

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
		<header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-4 md:px-6">
			<SidebarTrigger className="size-9 shrink-0" aria-label="Toggle navigation" />
			<Separator orientation="vertical" className="hidden h-5 sm:block" />
			<Breadcrumb className="min-w-0 flex-1">
				<BreadcrumbList className="flex-nowrap">
					{segments.map((segment, index) => {
						const isLast = index === segments.length - 1;
						return (
							// Only the current page is shown on phones; the full trail appears from `sm` up.
							<span className={isLast ? "contents" : "hidden sm:contents"} key={`${segment}-${index}`}>
								{index > 0 && <BreadcrumbSeparator className="hidden sm:inline-flex" />}
								<BreadcrumbItem className="min-w-0">
									<BreadcrumbPage className="truncate">{breadcrumbLabels[segment] ?? formatSegment(segment)}</BreadcrumbPage>
								</BreadcrumbItem>
							</span>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>

			<div className="ml-auto flex shrink-0 items-center gap-2">
				{availableRestaurants.length > 1 && (
					<label className="flex h-9 max-w-40 items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 text-xs text-foreground shadow-xs sm:max-w-56">
						<Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
						<span className="sr-only">Active restaurant</span>
						<select
							value={activeRestaurantId}
							disabled={isPending}
							onChange={(e) => handleSwitch(e.target.value)}
							className="min-w-0 flex-1 cursor-pointer truncate border-none bg-transparent py-0 pr-1 font-semibold outline-none focus:ring-0"
						>
							{availableRestaurants.map((r: any) => (
								<option key={r.id} value={r.id}>
									{r.name}
								</option>
							))}
						</select>
					</label>
				)}

				<Button
					variant="outline"
					nativeButton={false}
					render={<Link href={customerMenuUrl} target="_blank" rel="noopener noreferrer" aria-label="Open customer menu in a new tab" />}
					className="h-9 shrink-0 gap-1.5 px-2.5 text-xs font-semibold sm:px-3"
				>
					<Globe className="size-4 text-muted-foreground" aria-hidden="true" />
					<span className="hidden sm:inline">Customer view</span>
				</Button>
			</div>
		</header>
	);
}
