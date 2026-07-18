"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

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

const breadcrumbLabels: Record<string, string> = {
	admin: "Admin",
	"menu-items": "Menu items",
	new: "Create new",
};

export function AdminHeader() {
	const segments = usePathname().split("/").filter(Boolean);

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
			<Button variant="outline" className="ml-auto hidden min-w-56 justify-start text-muted-foreground md:flex">
				<Search aria-hidden="true" />
				<span>Search anything...</span>
				<kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd>
			</Button>
		</header>
	);
}
