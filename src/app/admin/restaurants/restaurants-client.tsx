"use client";

import { useState, useTransition, useEffect } from "react";
import { 
	Plus, 
	Building2, 
	GitBranch, 
	ArrowRight, 
	Clock, 
	Globe, 
	Loader2, 
	X, 
	CheckCircle2, 
	AlertCircle,
	ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
	Sheet, 
	SheetContent, 
	SheetHeader, 
	SheetTitle, 
	SheetDescription 
} from "@/components/ui/sheet";
import { 
	createRestaurantAction, 
	createBranchAction, 
	switchContext,
	getBranchesList,
	copyMenuStructureAction
} from "../actions";
import type { Restaurant, Branch } from "@/lib/server/menu-repository";

type ClientRestaurant = Restaurant;

export default function RestaurantsClient({ initialRestaurants }: { initialRestaurants: ClientRestaurant[] }) {
	const [restaurants, setRestaurants] = useState<ClientRestaurant[]>(initialRestaurants);
	const [selectedRestaurant, setSelectedRestaurant] = useState<ClientRestaurant | null>(null);
	const [branches, setBranches] = useState<Branch[]>([]);
	
	// Sheet States
	const [showCreateRestaurant, setShowCreateRestaurant] = useState(false);
	const [showBranches, setShowBranches] = useState(false);
	const [showCopyStructure, setShowCopyStructure] = useState(false);
	
	// Copy States
	const [sourceRestaurantId, setSourceRestaurantId] = useState("");
	const [targetRestaurantId, setTargetRestaurantId] = useState("");
	const [copyError, setCopyError] = useState("");
	
	// Pending states
	const [isPending, startTransition] = useTransition();
	const [branchesLoading, setBranchesLoading] = useState(false);
	
	// Form Error states
	const [error, setError] = useState("");

	// Copy Structure Handler
	async function handleCopyStructure(e: React.FormEvent) {
		e.preventDefault();
		setCopyError("");

		if (!sourceRestaurantId || !targetRestaurantId) {
			setCopyError("Please select both source and target restaurants.");
			return;
		}

		if (sourceRestaurantId === targetRestaurantId) {
			setCopyError("Source and target restaurants must be different.");
			return;
		}

		if (!confirm("Are you sure you want to copy the menu structure? This will copy all categories, menu items, prices, and schedules from the source to the target restaurant.")) {
			return;
		}

		startTransition(async () => {
			try {
				await copyMenuStructureAction({
					sourceRestaurantId,
					targetRestaurantId
				});
				setShowCopyStructure(false);
				setSourceRestaurantId("");
				setTargetRestaurantId("");
				alert("Menu structure copied successfully!");
				window.location.reload();
			} catch (err: any) {
				setCopyError(err.message || "Failed to copy menu structure.");
			}
		});
	}
	
	// Load branches when a restaurant is selected
	async function loadBranches(restaurantId: string) {
		setBranchesLoading(true);
		try {
			const list = await getBranchesList(restaurantId);
			setBranches(list);
		} catch (err) {
			console.error("Failed to load branches", err);
		} finally {
			setBranchesLoading(false);
		}
	}

	useEffect(() => {
		if (selectedRestaurant) {
			void loadBranches(selectedRestaurant.id);
		}
	}, [selectedRestaurant]);

	// Handle switching context
	function handleEnterRestaurant(restaurantId: string, branchId?: string) {
		startTransition(async () => {
			await switchContext(restaurantId, branchId);
			window.location.href = "/admin/menu-items";
		});
	}

	// Create Restaurant Handler
	async function handleCreateRestaurant(form: FormData) {
		setError("");
		const name = form.get("name") as string;
		const slug = form.get("slug") as string;
		const timezone = form.get("timezone") as string;
		const defaultLocale = form.get("defaultLocale") as string;
		const copyOfRestaurantId = form.get("copyOfRestaurantId") as string || undefined;

		if (!name || !slug) {
			setError("Name and Slug are required.");
			return;
		}

		startTransition(async () => {
			try {
				await createRestaurantAction({ name, slug, timezone, defaultLocale, copyOfRestaurantId });
				setShowCreateRestaurant(false);
				// Full reload to refresh server component props
				window.location.reload();
			} catch (err: any) {
				setError(err.message || "Failed to create restaurant.");
			}
		});
	}

	// Create Branch Handler
	async function handleCreateBranch(form: FormData) {
		if (!selectedRestaurant) return;
		setError("");
		const name = form.get("branchName") as string;
		const slug = form.get("branchSlug") as string;
		const timezone = form.get("branchTimezone") as string;

		if (!name || !slug) {
			setError("Branch Name and Slug are required.");
			return;
		}

		startTransition(async () => {
			try {
				await createBranchAction(selectedRestaurant.id, { name, slug, timezone });
				// Reload branches
				await loadBranches(selectedRestaurant.id);
				// Update restaurant list in UI by incrementing branch count
				setRestaurants(prev => 
					prev.map(r => r.id === selectedRestaurant.id ? { ...r, branch_count: r.branch_count + 1 } : r)
				);
				// Reset form inputs (native HTML way)
				const formEl = document.getElementById("create-branch-form") as HTMLFormElement;
				formEl?.reset();
			} catch (err: any) {
				setError(err.message || "Failed to create branch.");
			}
		});
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			{/* Top Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 text-stone-900">
						<Building2 className="size-8 text-primary" />
						Organizations & Restaurants
					</h1>
					<p className="mt-1 text-sm text-stone-500">
						Manage your multi-tenant hierarchy (Realms) and access menus of specific locations.
					</p>
				</div>
				<div className="flex gap-2.5 shrink-0">
					<Button 
						variant="outline"
						onClick={() => { setCopyError(""); setShowCopyStructure(true); }} 
						className="min-h-11 border-stone-200"
					>
						<GitBranch className="size-4 mr-1 text-stone-500" />
						Copy Menu Structure
					</Button>
					<Button onClick={() => { setError(""); setShowCreateRestaurant(true); }} className="min-h-11">
						<Plus className="size-4 mr-1" />
						Create Restaurant
					</Button>
				</div>
			</div>

			{/* Main Grid: Restaurants List */}
			<Card className="border border-stone-200 bg-white shadow-xs">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg">All Restaurants</CardTitle>
					<CardDescription>
						Click &quot;Enter Management&quot; to manage categories, menus, and users for that specific restaurant.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{restaurants.length === 0 ? (
						<div className="text-center p-12 text-muted-foreground">
							<Building2 className="mx-auto size-12 text-stone-300 mb-2" />
							<p className="font-semibold text-stone-800">No restaurants found</p>
							<p className="text-xs text-muted-foreground mt-0.5">Click the button above to add a new organization.</p>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{restaurants.map((restaurant) => (
								<div 
									key={restaurant.id} 
									className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-stone-50/40 transition-colors"
								>
									<div className="flex items-start gap-3">
										<div className="mt-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
											<Building2 className="size-5" />
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-bold text-stone-900 text-base">{restaurant.name}</span>
												<Badge variant={restaurant.status === "active" ? "default" : "secondary"}>
													{restaurant.status}
												</Badge>
											</div>
											<div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
												<span className="flex items-center gap-1 font-mono text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded" title={`ID: ${restaurant.id}`}>
													ID: {restaurant.id.slice(0, 8)}...
												</span>
												<span className="flex items-center gap-1">
													<Globe className="size-3 text-stone-400" />
													Slug: <code className="bg-stone-100 px-1 rounded font-mono">{restaurant.slug}</code>
												</span>
												<span className="flex items-center gap-1">
													<Clock className="size-3 text-stone-400" />
													{restaurant.timezone}
												</span>
												<span className="flex items-center gap-1">
													<GitBranch className="size-3 text-stone-400" />
													{restaurant.branch_count} Branches
												</span>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex items-center gap-2 sm:self-center">
										<Button 
											variant="outline" 
											onClick={() => {
												setSelectedRestaurant(restaurant);
												setShowBranches(true);
											}}
											className="min-h-10 text-xs font-semibold px-4 border-stone-200"
										>
											<GitBranch className="size-3.5 mr-1.5" />
											Branches ({restaurant.branch_count})
										</Button>
										
										<Button 
											disabled={isPending}
											onClick={() => handleEnterRestaurant(restaurant.id)}
											className="min-h-10 text-xs font-semibold px-4"
										>
											{isPending ? (
												<Loader2 className="size-3.5 animate-spin mr-1.5" />
											) : (
												<ArrowRight className="size-3.5 mr-1.5" />
											)}
											Enter Management
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Restaurant Drawer */}
			<Sheet open={showCreateRestaurant} onOpenChange={setShowCreateRestaurant}>
				<SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white flex flex-col h-full border-l border-stone-200 shadow-xl">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-bold text-stone-900">New Restaurant</SheetTitle>
						<SheetDescription className="text-stone-500 text-xs mt-0.5">
							Create a new master organization. This automatically creates a default branch.
						</SheetDescription>
					</SheetHeader>

					<form 
						onSubmit={(e) => {
							e.preventDefault();
							void handleCreateRestaurant(new FormData(e.currentTarget));
						}}
						className="flex-1 flex flex-col gap-5 pt-5"
					>
						<div className="grid gap-2">
							<label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Restaurant Name
							</label>
							<Input 
								required 
								id="name" 
								name="name" 
								className="min-h-11" 
								placeholder="e.g. Sabay Kitchen Riverside" 
								onChange={(e) => {
									// Auto-generate slug
									const slugInput = document.getElementById("slug") as HTMLInputElement;
									if (slugInput) {
										slugInput.value = e.target.value
											.toLowerCase()
											.replace(/[^a-z0-9]+/g, "-")
											.replace(/(^-|-$)/g, "");
									}
								}}
							/>
						</div>

						<div className="grid gap-2">
							<label htmlFor="slug" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								URL Slug
							</label>
							<Input 
								required 
								id="slug" 
								name="slug" 
								className="min-h-11 font-mono" 
								placeholder="e.g. sabay-kitchen-riverside" 
							/>
						</div>

						<div className="grid gap-2">
							<label htmlFor="timezone" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Timezone
							</label>
							<Input 
								required 
								id="timezone" 
								name="timezone" 
								defaultValue="Asia/Phnom_Penh" 
								className="min-h-11" 
							/>
						</div>

						<div className="grid gap-2">
							<label htmlFor="defaultLocale" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Default Locale
							</label>
							<select 
								id="defaultLocale" 
								name="defaultLocale" 
								defaultValue="km-KH"
								className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
							>
								<option value="km-KH">Khmer (km-KH)</option>
								<option value="en">English (en)</option>
							</select>
						</div>

						<div className="grid gap-2">
							<label htmlFor="copyOfRestaurantId" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Copy Menu Structure From (Optional)
							</label>
							<select 
								id="copyOfRestaurantId" 
								name="copyOfRestaurantId" 
								defaultValue=""
								className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
							>
								<option value="">None - Create Fresh</option>
								{restaurants.map((r) => (
									<option key={r.id} value={r.id}>{r.name}</option>
								))}
							</select>
						</div>

						{error && (
							<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
								<AlertCircle className="size-4 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="mt-auto flex justify-end gap-3 border-t pt-4">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setShowCreateRestaurant(false)}
								className="h-11 border-stone-200"
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending} className="h-11 px-6">
								{isPending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Creating…
									</>
								) : (
									"Create"
								)}
							</Button>
						</div>
					</form>
				</SheetContent>
			</Sheet>

			{/* Branches Sheet Dialog */}
			<Sheet open={showBranches} onOpenChange={setShowBranches}>
				<SheetContent side="right" className="w-full sm:max-w-lg p-6 bg-white flex flex-col h-full border-l border-stone-200 shadow-xl">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
							<GitBranch className="size-6 text-primary" />
							{selectedRestaurant?.name} Branches
						</SheetTitle>
						<SheetDescription className="text-stone-500 text-xs mt-0.5">
							Manage the branch locations for this restaurant organization.
						</SheetDescription>
					</SheetHeader>

					{/* Branches List */}
					<div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
						{branchesLoading ? (
							<div className="flex flex-col items-center justify-center p-8 text-stone-400">
								<Loader2 className="size-8 animate-spin text-primary mb-2" />
								<span className="text-xs">Loading branches...</span>
							</div>
						) : branches.length === 0 ? (
							<div className="text-center p-6 bg-stone-50 rounded-lg border border-dashed border-stone-200">
								<p className="text-sm font-semibold text-stone-600">No branches configured</p>
							</div>
						) : (
							<div className="flex flex-col gap-2">
								<span className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Active Branches</span>
								{branches.map((branch) => (
									<div 
										key={branch.id} 
										className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-stone-100 rounded-xl transition-all"
									>
										<div>
											<p className="font-semibold text-stone-850 text-sm">{branch.name}</p>
											<p className="text-xs font-mono text-stone-400 mt-0.5">Slug: {branch.slug}</p>
										</div>
										<Button 
											size="sm" 
											onClick={() => handleEnterRestaurant(branch.restaurant_id, branch.id)}
											className="h-9 text-xs"
											disabled={isPending}
										>
											Enter
										</Button>
									</div>
								))}
							</div>
						)}

						{/* Add Branch Section */}
						<div className="mt-4 border-t border-stone-100 pt-5">
							<span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3">Add New Branch</span>
							<form 
								id="create-branch-form"
								onSubmit={(e) => {
									e.preventDefault();
									void handleCreateBranch(new FormData(e.currentTarget));
								}}
								className="grid gap-3.5 bg-stone-50 p-4 rounded-xl border border-stone-200"
							>
								<div className="grid gap-1.5">
									<label htmlFor="branchName" className="text-xs font-semibold text-stone-600">Branch Name</label>
									<Input 
										required 
										id="branchName" 
										name="branchName" 
										placeholder="e.g. Riverside" 
										className="bg-white min-h-10 text-sm"
										onChange={(e) => {
											const slugInput = document.getElementById("branchSlug") as HTMLInputElement;
											if (slugInput) {
												slugInput.value = e.target.value
													.toLowerCase()
													.replace(/[^a-z0-9]+/g, "-")
													.replace(/(^-|-$)/g, "");
											}
										}}
									/>
								</div>
								
								<div className="grid gap-1.5">
									<label htmlFor="branchSlug" className="text-xs font-semibold text-stone-600">Branch Slug</label>
									<Input 
										required 
										id="branchSlug" 
										name="branchSlug" 
										placeholder="e.g. riverside" 
										className="bg-white min-h-10 text-sm font-mono"
									/>
								</div>
								
								<div className="grid gap-1.5">
									<label htmlFor="branchTimezone" className="text-xs font-semibold text-stone-600">Timezone</label>
									<Input 
										required 
										id="branchTimezone" 
										name="branchTimezone" 
										defaultValue={selectedRestaurant?.timezone || "Asia/Phnom_Penh"} 
										className="bg-white min-h-10 text-sm"
									/>
								</div>

								{error && (
									<div className="flex items-center gap-1.5 text-xs text-red-650 font-semibold p-1">
										<AlertCircle className="size-3.5 shrink-0" />
										<span>{error}</span>
									</div>
								)}

								<Button 
									type="submit" 
									className="h-10 mt-1 w-full text-xs font-bold"
									disabled={isPending}
								>
									{isPending ? (
										<Loader2 className="size-3.5 animate-spin mr-1.5" />
									) : (
										<Plus className="size-3.5 mr-1.5" />
									)}
									Create Branch
								</Button>
							</form>
						</div>
					</div>

					<div className="border-t pt-4 mt-auto flex justify-end">
						<Button variant="outline" onClick={() => setShowBranches(false)} className="h-10 border-stone-200">
							Close
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			{/* Copy Menu Structure Drawer */}
			<Sheet open={showCopyStructure} onOpenChange={setShowCopyStructure}>
				<SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white flex flex-col h-full border-l border-stone-200 shadow-xl">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
							<GitBranch className="size-6 text-primary" />
							Copy Menu Structure
						</SheetTitle>
						<SheetDescription className="text-stone-500 text-xs mt-0.5">
							Copy all categories, items, prices, and schedules from one restaurant to another.
						</SheetDescription>
					</SheetHeader>

					<form 
						onSubmit={handleCopyStructure}
						className="flex-1 flex flex-col gap-5 pt-5"
					>
						<div className="grid gap-2">
							<label htmlFor="sourceRestaurant" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Source Restaurant (Copy From)
							</label>
							<select 
								id="sourceRestaurant" 
								value={sourceRestaurantId}
								onChange={(e) => setSourceRestaurantId(e.target.value)}
								required
								className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
							>
								<option value="">Select source restaurant</option>
								{restaurants.map((r) => (
									<option key={r.id} value={r.id}>{r.name}</option>
								))}
							</select>
						</div>

						<div className="grid gap-2">
							<label htmlFor="targetRestaurant" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Target Restaurant (Copy To)
							</label>
							<select 
								id="targetRestaurant" 
								value={targetRestaurantId}
								onChange={(e) => setTargetRestaurantId(e.target.value)}
								required
								className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
							>
								<option value="">Select target restaurant</option>
								{restaurants
									.filter((r) => r.id !== sourceRestaurantId)
									.map((r) => (
										<option key={r.id} value={r.id}>{r.name}</option>
									))}
							</select>
						</div>

						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-800 font-semibold leading-relaxed">
							<AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
							<div>
								<p className="font-bold text-amber-900">Important Warning</p>
								<p className="mt-1">This will merge categories, menu items, and schedules from the source restaurant into the target restaurant.</p>
								<p className="mt-1">Duplicate categories, items, or schedules will be appended, and existing data inside the target restaurant will not be deleted.</p>
							</div>
						</div>

						{copyError && (
							<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
								<AlertCircle className="size-4 shrink-0" />
								<span>{copyError}</span>
							</div>
						)}

						<div className="mt-auto flex justify-end gap-3 border-t pt-4">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setShowCopyStructure(false)}
								className="h-11 border-stone-200"
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending} className="h-11 px-6">
								{isPending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Copying…
									</>
								) : (
									"Copy Structure"
								)}
							</Button>
						</div>
					</form>
				</SheetContent>
			</Sheet>
		</main>
	);
}
