import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MenuItemsTable } from "@/components/admin/menu-items-table";
import { Button } from "@/components/ui/button";
import { listAdminMenuItems } from "@/lib/server/menu-repository";
export const metadata: Metadata={title:"Menu items"};
export const dynamic="force-dynamic";
export default async function MenuItemsPage(){const menuItems=await listAdminMenuItems();return <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Menu items</h1><p className="mt-1 text-sm text-muted-foreground">Create, translate, schedule, and control the availability of restaurant items.</p></div><Button size="lg" nativeButton={false} render={<Link href="/admin/menu-items/new" />} className="min-h-11 sm:self-center"><Plus aria-hidden="true"/>Create new</Button></div><MenuItemsTable data={menuItems}/></main>}
