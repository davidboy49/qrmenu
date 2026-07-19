"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, MapPin, Loader2, GitBranch, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
	getActiveContextDetails, 
	getBranchesList, 
	createBranchAction, 
	switchContext,
	copyBranchContextAction,
	updateBranchAction
} from "../actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { Branch } from "@/lib/server/menu-repository";

export default function BranchesPage() {
	const [branches, setBranches] = useState<Branch[]>([]);
	const [restaurantName, setRestaurantName] = useState("");
	const [restaurantId, setRestaurantId] = useState("");
	const [activeBranchId, setActiveBranchId] = useState("");
	
	const [showForm, setShowForm] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const [sourceBranchId, setSourceBranchId] = useState("");
	const [importError, setImportError] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	// Edit Branch States
	const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
	const [editName, setEditName] = useState("");
	const [editSlug, setEditSlug] = useState("");
	const [editTimezone, setEditTimezone] = useState("");
	const [editError, setEditError] = useState("");

	useEffect(() => {
		if (editingBranch) {
			setEditName(editingBranch.name);
			setEditSlug(editingBranch.slug);
			setEditTimezone(editingBranch.timezone);
			setEditError("");
		}
	}, [editingBranch]);

	async function handleUpdateBranch(e: React.FormEvent) {
		e.preventDefault();
		setEditError("");

		if (!editName || !editSlug) {
			setEditError("Branch Name and URL Slug are required.");
			return;
		}

		if (!confirm(`Are you sure you want to save changes to this branch?`)) {
			return;
		}

		startTransition(async () => {
			try {
				await updateBranchAction(editingBranch!.id, {
					name: editName,
					slug: editSlug,
					timezone: editTimezone
				});
				setEditingBranch(null);
				await load();
			} catch (err: any) {
				setEditError(err.message || "Failed to update branch.");
			}
		});
	}

	async function handleImport(e: React.FormEvent) {
		e.preventDefault();
		setImportError("");

		if (!sourceBranchId) {
			setImportError("Please select a source branch.");
			return;
		}

		if (!confirm("Are you sure you want to import branch settings? This will overwrite all custom prices and sold-out states on the active branch with values from the selected branch.")) {
			return;
		}

		startTransition(async () => {
			try {
				await copyBranchContextAction({
					sourceBranchId,
					targetBranchId: activeBranchId
				});
				setShowImport(false);
				setSourceBranchId("");
				alert("Branch settings imported successfully!");
				window.location.reload();
			} catch (err: any) {
				setImportError(err.message || "Failed to import branch settings.");
			}
		});
	}

	async function load() {
		try {
			const context = await getActiveContextDetails();
			setRestaurantName(context.restaurantName);
			setRestaurantId(context.restaurantId);
			setActiveBranchId(context.branchId);

			const list = await getBranchesList(context.restaurantId);
			setBranches(list);
		} catch (err) {
			console.error("Failed to load branches", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function handleSwitch(branchId: string) {
		startTransition(async () => {
			await switchContext(restaurantId, branchId);
			window.location.reload();
		});
	}

	async function save(form: FormData) {
		setError("");
		const name = form.get("name") as string;
		const slug = form.get("slug") as string;
		const timezone = form.get("timezone") as string;

		if (!name || !slug) {
			setError("Branch Name and Slug are required.");
			return;
		}

		if (!confirm(`Are you sure you want to create the branch "${name}"?`)) return;

		startTransition(async () => {
			try {
				await createBranchAction(restaurantId, { name, slug, timezone });
				setShowForm(false);
				await load();
			} catch (err: any) {
				setError(err.message || "Could not create branch.");
			}
		});
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 text-stone-900">
						<MapPin className="size-8 text-primary" />
						Branches & Locations
					</h1>
					<p className="mt-1 text-sm text-stone-500">
						Manage physical store locations for <strong className="text-stone-700">{restaurantName}</strong>.
					</p>
				</div>
				{!showForm && (
					<div className="flex gap-2.5 shrink-0">
						{branches.length > 1 && (
							<Button 
								variant="outline" 
								onClick={() => { setImportError(""); setSourceBranchId(""); setShowImport(true); }} 
								className="min-h-11 border-stone-200"
							>
								<GitBranch className="size-4 mr-1 text-stone-500" />
								Import Settings
							</Button>
						)}
						<Button onClick={() => { setError(""); setShowForm(true); }} className="min-h-11">
							<Plus className="size-4 mr-1" />
							Add branch
						</Button>
					</div>
				)}
			</div>

			{showForm && (
				<Card className="max-w-2xl border border-stone-250 bg-white shadow-xs">
					<CardHeader>
						<CardTitle>New branch</CardTitle>
						<CardDescription>Add a new location context for {restaurantName}.</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={save} className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="name" className="text-sm font-semibold text-stone-700">
									Branch Name
								</label>
								<Input 
									required 
									id="name" 
									name="name" 
									className="min-h-11" 
									placeholder="e.g. Riverside Outlet" 
									onChange={(e) => {
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
								<label htmlFor="slug" className="text-sm font-semibold text-stone-700">
									Branch Slug
								</label>
								<Input 
									required 
									id="slug" 
									name="slug" 
									className="min-h-11 font-mono" 
									placeholder="e.g. riverside-outlet" 
								/>
							</div>

							<div className="grid gap-2 sm:col-span-2">
								<label htmlFor="timezone" className="text-sm font-semibold text-stone-700">
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

							{error && (
								<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3 sm:col-span-2">
									<AlertCircle className="size-4 shrink-0" />
									<span>{error}</span>
								</div>
							)}

							<div className="flex justify-end gap-3 sm:col-span-2 border-t pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (confirm("Are you sure you want to discard this branch?")) {
											setShowForm(false);
										}
									}}
									className="h-11 border-stone-200"
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isPending} className="h-11 px-6">
									{isPending ? (
										<Loader2 className="size-4 animate-spin mr-2" />
									) : (
										"Create branch"
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card className="border border-stone-200 bg-white shadow-xs">
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-stone-400">
							<Loader2 className="size-8 animate-spin text-primary mb-2" />
							<span>Loading branches list…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{branches.map((branch) => {
								const isActive = branch.id === activeBranchId;
								return (
									<div 
										key={branch.id} 
										className={`flex items-center justify-between gap-4 p-4.5 transition-colors ${
											isActive ? "bg-stone-50/50" : "hover:bg-stone-50/20"
										}`}
									>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-bold text-stone-900">{branch.name}</span>
												{isActive && (
													<Badge variant="default" className="text-[10px] font-bold px-1.5 py-0.5">
														Active Context
													</Badge>
												)}
											</div>
											<p className="mt-1 text-xs text-stone-400 font-mono">
												Slug: {branch.slug} • Timezone: {branch.timezone}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button 
												variant="outline" 
												onClick={() => setEditingBranch(branch)}
												className="min-h-9 text-xs px-3 border-stone-200"
												disabled={isPending}
											>
												Edit Details
											</Button>
											{!isActive && (
												<Button 
													variant="outline" 
													onClick={() => handleSwitch(branch.id)}
													className="min-h-9 text-xs px-3 border-stone-200"
													disabled={isPending}
												>
													Switch active location
												</Button>
											)}
										</div>
									</div>
								);
							})}

							{branches.length === 0 && (
								<div className="text-center p-12 text-muted-foreground">
									<GitBranch className="mx-auto size-8 text-stone-300 mb-2" />
									<p className="font-semibold text-stone-800">No branches configured</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Import Settings Drawer */}
			<Sheet open={showImport} onOpenChange={setShowImport}>
				<SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white flex flex-col h-full border-l border-stone-200 shadow-xl">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
							<GitBranch className="size-6 text-primary" />
							Import Branch Settings
						</SheetTitle>
						<SheetDescription className="text-stone-500 text-xs mt-0.5">
							Copy pricing overrides and sold-out states from another branch to the active branch context.
						</SheetDescription>
					</SheetHeader>

					<form 
						onSubmit={handleImport}
						className="flex-1 flex flex-col gap-5 pt-5"
					>
						<div className="grid gap-2">
							<label htmlFor="sourceBranch" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Source Branch (Copy From)
							</label>
							<select 
								id="sourceBranch" 
								value={sourceBranchId}
								onChange={(e) => setSourceBranchId(e.target.value)}
								required
								className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
							>
								<option value="">Select source branch</option>
								{branches
									.filter((b) => b.id !== activeBranchId)
									.map((b) => (
										<option key={b.id} value={b.id}>{b.name}</option>
									))}
							</select>
						</div>

						<div className="grid gap-2">
							<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Target Branch (Copy Into)
							</label>
							<Input 
								value={branches.find((b) => b.id === activeBranchId)?.name || "Active Branch"}
								disabled
								className="min-h-11 bg-stone-50 opacity-70 cursor-not-allowed text-stone-600" 
							/>
						</div>

						<div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-800 font-semibold leading-relaxed">
							<AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
							<div>
								<p className="font-bold text-amber-900">Overwriting Warning</p>
								<p className="mt-1">This will overwrite the target branch's custom pricing overrides and sold-out item states.</p>
								<p className="mt-1">All current configuration overrides on the target branch will be deleted and replaced with values from the source branch.</p>
							</div>
						</div>

						{importError && (
							<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
								<AlertCircle className="size-4 shrink-0" />
								<span>{importError}</span>
							</div>
						)}

						<div className="mt-auto flex justify-end gap-3 border-t pt-4">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setShowImport(false)}
								className="h-11 border-stone-200"
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending} className="h-11 px-6">
								{isPending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Importing…
									</>
								) : (
									"Import Settings"
								)}
							</Button>
						</div>
					</form>
				</SheetContent>
			</Sheet>

			{/* Edit Branch Details Drawer */}
			<Sheet open={!!editingBranch} onOpenChange={(open) => !open && setEditingBranch(null)}>
				<SheetContent side="right" className="w-full sm:max-w-md p-6 bg-white flex flex-col h-full border-l border-stone-200 shadow-xl">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
							<GitBranch className="size-6 text-primary" />
							Edit Branch Details
						</SheetTitle>
						<SheetDescription className="text-stone-500 text-xs mt-0.5">
							Update details for this branch location context.
						</SheetDescription>
					</SheetHeader>

					<form 
						onSubmit={handleUpdateBranch}
						className="flex-1 flex flex-col gap-5 pt-5"
					>
						<div className="grid gap-2">
							<label htmlFor="editBranchName" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Branch Name
							</label>
							<Input 
								required 
								id="editBranchName" 
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								className="min-h-11" 
								placeholder="e.g. Riverside Bistro" 
							/>
						</div>

						<div className="grid gap-2">
							<label htmlFor="editBranchSlug" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								URL Slug (Branch Identifier)
							</label>
							<Input 
								required 
								id="editBranchSlug" 
								value={editSlug}
								onChange={(e) => setEditSlug(e.target.value)}
								className="min-h-11 font-mono" 
								placeholder="e.g. riverside-bistro" 
							/>
							<span className="text-[10px] text-amber-700 font-semibold bg-amber-50 p-2 border border-amber-250 rounded">
								⚠️ Warning: Changing the URL slug will break any existing printed QR codes pointing to this branch!
							</span>
						</div>

						<div className="grid gap-2">
							<label htmlFor="editBranchTimezone" className="text-xs font-bold uppercase tracking-wider text-stone-500">
								Timezone
							</label>
							<Input 
								required 
								id="editBranchTimezone" 
								value={editTimezone}
								onChange={(e) => setEditTimezone(e.target.value)}
								className="min-h-11" 
							/>
						</div>

						{editError && (
							<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
								<AlertCircle className="size-4 shrink-0" />
								<span>{editError}</span>
							</div>
						)}

						<div className="mt-auto flex justify-end gap-3 border-t pt-4">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setEditingBranch(null)}
								className="h-11 border-stone-200"
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending} className="h-11 px-6">
								{isPending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Saving…
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</form>
				</SheetContent>
			</Sheet>
		</main>
	);
}
