import { Skeleton } from "@/components/ui/skeleton";

/* Shared admin skeleton: page header, toolbar and a list, matching the common page layout. */
export default function AdminLoading() {
	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8" aria-busy="true">
			<span className="sr-only">Loading…</span>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48 md:h-9" />
					<Skeleton className="h-4 w-72 max-w-full" />
				</div>
				<Skeleton className="h-11 w-full sm:w-36" />
			</div>
			<div className="flex flex-col gap-3 lg:flex-row">
				<Skeleton className="h-10 w-full lg:max-w-sm" />
				<Skeleton className="h-10 w-36" />
			</div>
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3">
						<Skeleton className="size-12 shrink-0 rounded-lg" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-2/5" />
							<Skeleton className="h-3 w-1/4" />
						</div>
						<Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
					</div>
				))}
			</div>
		</main>
	);
}
