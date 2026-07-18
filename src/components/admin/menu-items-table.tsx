"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
	type ColumnDef,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Pencil, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type MenuItemRow = {
	id: string;
	nameEn: string;
	nameKm: string;
	category: string;
	priceKhr: number;
	priceUsd: number;
	schedules: string[];
	status: "active" | "inactive" | "sold-out";
	translationComplete: boolean;
	updatedAt: string;
};

const globalMenuFilter: FilterFn<MenuItemRow> = (row, _columnId, value) => {
	const query = String(value).trim().toLocaleLowerCase();
	if (!query) return true;
	const item = row.original;
	return [item.nameEn, item.nameKm, item.category, ...item.schedules]
		.join(" ")
		.toLocaleLowerCase()
		.includes(query);
};

function StatusBadge({ status }: { status: MenuItemRow["status"] }) {
	if (status === "active") {
		return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Active</Badge>;
	}
	if (status === "sold-out") {
		return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Sold out</Badge>;
	}
	return <Badge variant="secondary">Inactive</Badge>;
}

export function MenuItemsTable({ data }: { data: MenuItemRow[] }) {
	const [globalFilter, setGlobalFilter] = useState("");
	const [status, setStatus] = useState("all");
	const statusLabel = status === "all" ? "All statuses" : status === "sold-out" ? "Sold out" : `${status[0].toUpperCase()}${status.slice(1)}`;

	const columns = useMemo<ColumnDef<MenuItemRow>[]>(
		() => [
			{
				id: "item",
				header: "Item",
				cell: ({ row }) => (
					<div className="flex min-w-56 items-center gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
							{row.original.nameEn.slice(0, 2).toUpperCase()}
						</div>
						<div className="min-w-0">
							<p className="truncate font-medium">{row.original.nameEn}</p>
							<p lang="km" className="truncate text-sm text-muted-foreground">{row.original.nameKm || "Missing Khmer name"}</p>
						</div>
					</div>
				),
			},
			{ accessorKey: "category", header: "Category" },
			{
				id: "price",
				header: "Price",
				cell: ({ row }) => (
					<div className="whitespace-nowrap">
						<p>{new Intl.NumberFormat("km-KH").format(row.original.priceKhr)} ៛</p>
						<p className="text-xs text-muted-foreground">${row.original.priceUsd.toFixed(2)}</p>
					</div>
				),
			},
			{
				id: "schedules",
				header: "Schedules",
				cell: ({ row }) => <span className="text-sm">{row.original.schedules.join(", ")}</span>,
			},
			{
				accessorKey: "status",
				header: "Status",
				filterFn: (row, columnId, value) => value === "all" || row.getValue(columnId) === value,
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
			},
			{
				id: "translation",
				header: "Translation",
				cell: ({ row }) =>
					row.original.translationComplete ? <Badge variant="outline">Complete</Badge> : <Badge variant="destructive">Missing</Badge>,
			},
			{ accessorKey: "updatedAt", header: "Updated" },
			{
				id: "actions",
				header: () => <span className="sr-only">Actions</span>,
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="icon"
						render={<Link href={`/admin/menu-items/${row.original.id}`} aria-label={`Edit ${row.original.nameEn}`} />}
					>
						<Pencil aria-hidden="true" />
					</Button>
				),
			},
		],
		[],
	);

	// TanStack Table intentionally returns mutable callbacks; React Compiler safely skips this hook.
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns,
		state: { globalFilter },
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: globalMenuFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: 8 } },
	});

	function changeStatus(nextStatus: string | null) {
		const value = nextStatus ?? "all";
		setStatus(value);
		table.getColumn("status")?.setFilterValue(value);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="relative w-full lg:max-w-sm">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
					<Input
						value={globalFilter}
						onChange={(event) => setGlobalFilter(event.target.value)}
						placeholder="Search Khmer or English names..."
						aria-label="Search menu items"
						className="h-10 pl-9"
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					<Select value={status} onValueChange={changeStatus}>
						<SelectTrigger className="h-10 min-w-36" aria-label="Filter by status">
							<span>{statusLabel}</span>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
							<SelectItem value="sold-out">Sold out</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" className="h-10">
						<SlidersHorizontal aria-hidden="true" />
						More filters
					</Button>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-28 text-center">
										<p className="font-medium">No menu items found</p>
										<p className="mt-1 text-sm text-muted-foreground">Try another search or clear the status filter.</p>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<p>{table.getFilteredRowModel().rows.length} menu items</p>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
						<ChevronLeft aria-hidden="true" />
					</Button>
					<span className="min-w-24 text-center text-foreground">
						Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
					</span>
					<Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
						<ChevronRight aria-hidden="true" />
					</Button>
				</div>
			</div>
		</div>
	);
}
