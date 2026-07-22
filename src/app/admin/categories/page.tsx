"use client";

import { useEffect, useState } from "react";
import { Plus, FolderPlus, Loader2, X, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Category = {
	id: string;
	code: string;
	nameEn: string;
	nameKm: string;
	status: "active" | "inactive";
	itemCount: number;
};

function deriveCode(name: string): string {
	const cleaned = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
	if (cleaned.length >= 3) return cleaned.slice(0, 3);
	if (cleaned.length > 0) return (cleaned + "XXX").slice(0, 3);
	return "CAT";
}

export default function CategoriesPage() {
	const [items, setItems] = useState<Category[]>([]);
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	// Create states
	const [createNameEn, setCreateNameEn] = useState("");
	const [createNameKm, setCreateNameKm] = useState("");
	const [createCode, setCreateCode] = useState("");
	const [userTouchedCode, setUserTouchedCode] = useState(false);

	// Edit states
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [editNameEn, setEditNameEn] = useState("");
	const [editNameKm, setEditNameKm] = useState("");
	const [editCode, setEditCode] = useState("");
	const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");
	const [editError, setEditError] = useState("");

	async function load() {
		try {
			const r = await fetch("/api/admin/categories");
			if (r.ok) {
				setItems((await r.json()) as Category[]);
			}
		} catch (err) {
			console.error("Failed to load categories", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	useEffect(() => {
		if (editingCategory) {
			setEditNameEn(editingCategory.nameEn);
			setEditNameKm(editingCategory.nameKm);
			setEditCode(editingCategory.code || deriveCode(editingCategory.nameEn));
			setEditStatus(editingCategory.status);
			setEditError("");
		}
	}, [editingCategory]);

	// Auto generate Category ID when typing English name if not manually modified
	function handleNameEnChange(val: string) {
		setCreateNameEn(val);
		if (!userTouchedCode) {
			setCreateCode(deriveCode(val));
		}
	}

	async function handleCreateSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!confirm("Are you sure you want to create this category?")) return;
		setError("");

		const r = await fetch("/api/admin/categories", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				nameEn: createNameEn,
				nameKm: createNameKm,
				code: createCode.toUpperCase().trim() || deriveCode(createNameEn),
			}),
		});

		if (!r.ok) {
			const body = (await r.json()) as { error?: string };
			setError(body.error || "Could not create category.");
			return;
		}

		setShow(false);
		setCreateNameEn("");
		setCreateNameKm("");
		setCreateCode("");
		setUserTouchedCode(false);
		await load();
	}

	async function handleUpdate(e: React.FormEvent) {
		e.preventDefault();
		if (!confirm("Are you sure you want to update this category?")) return;
		setEditError("");

		const r = await fetch(`/api/admin/categories?id=${editingCategory?.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				nameEn: editNameEn,
				nameKm: editNameKm,
				code: editCode.toUpperCase().trim() || deriveCode(editNameEn),
				status: editStatus,
			}),
		});

		if (!r.ok) {
			const body = (await r.json()) as { error?: string };
			setEditError(body.error || "Could not update category.");
			return;
		}

		setEditingCategory(null);
		await load();
	}

	async function handleMove(index: number, direction: "up" | "down") {
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= items.length) return;

		// Optimistic update
		const newItems = [...items];
		const temp = newItems[index];
		newItems[index] = newItems[targetIndex];
		newItems[targetIndex] = temp;
		setItems(newItems);

		// Synchronize with API
		try {
			const r = await fetch("/api/admin/categories?action=reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: newItems.map((item) => item.id) }),
			});
			if (!r.ok) {
				throw new Error("Failed to save reorder");
			}
		} catch (err) {
			console.error(err);
			// Revert on failure
			await load();
		}
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Categories</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Organize customer menu items in Khmer and English.
					</p>
				</div>
				{!show && (
					<Button onClick={() => setShow(true)} className="min-h-11 shrink-0">
						<Plus className="size-4 mr-1" />
						Create category
					</Button>
				)}
			</div>

			{show && (
				<Card className="max-w-2xl border shadow-xs">
					<CardHeader>
						<CardTitle>New category</CardTitle>
						<CardDescription>Category ID is auto-generated (3 letters) and customizable.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCreateSubmit} className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2 sm:col-span-2">
								<label htmlFor="createCode" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Category ID / Code (3 Digits / Letters)
								</label>
								<div className="flex items-center gap-2">
									<Input
										required
										id="createCode"
										value={createCode}
										onChange={(e) => {
											setCreateCode(e.target.value.toUpperCase());
											setUserTouchedCode(true);
										}}
										maxLength={10}
										className="min-h-11 font-mono uppercase font-bold text-base max-w-xs"
										placeholder="e.g. DES"
									/>
									<span className="text-xs text-muted-foreground">Derived from category name, editable</span>
								</div>
							</div>

							<div className="grid gap-2">
								<label htmlFor="nameEn" className="text-sm font-semibold text-stone-700">
									English name
								</label>
								<Input
									required
									id="nameEn"
									value={createNameEn}
									onChange={(e) => handleNameEnChange(e.target.value)}
									className="min-h-11"
									placeholder="e.g. Desserts"
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor="nameKm" className="text-sm font-semibold text-stone-700">
									Khmer name
								</label>
								<Input
									required
									id="nameKm"
									value={createNameKm}
									onChange={(e) => setCreateNameKm(e.target.value)}
									lang="km"
									className="min-h-11"
									placeholder="ឧ. បង្អែម"
								/>
							</div>

							{error && (
								<p role="alert" className="text-sm text-destructive font-medium sm:col-span-2">
									{error}
								</p>
							)}

							<div className="flex justify-end gap-3 sm:col-span-2 border-t pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										if (confirm("Are you sure you want to discard this category?")) {
											setShow(false);
										}
									}}
									className="h-11"
								>
									Cancel
								</Button>
								<Button type="submit" className="h-11">Create category</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card className="border shadow-xs">
				<CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-base">Category List</CardTitle>
						<CardDescription className="text-xs">Drag/move or sort categories</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
							<Loader2 className="size-8 animate-spin text-primary mb-2" />
							<span>Loading categories list…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{items.map((category, index) => {
								const isFirst = index === 0;
								const isLast = index === items.length - 1;
								return (
									<div key={category.id} className="flex items-center justify-between gap-4 p-4.5 hover:bg-stone-50/30 transition-colors">
										<div className="flex items-center gap-4">
											{/* Move controls */}
											<div className="flex flex-col gap-0.5">
												<Button
													variant="ghost"
													size="icon-sm"
													disabled={isFirst}
													onClick={() => handleMove(index, "up")}
													className="text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:hover:text-stone-400"
													aria-label="Move category up"
												>
													<ArrowUp className="size-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon-sm"
													disabled={isLast}
													onClick={() => handleMove(index, "down")}
													className="text-stone-400 hover:text-stone-700 disabled:opacity-30 disabled:hover:text-stone-400"
													aria-label="Move category down"
												>
													<ArrowDown className="size-4" />
												</Button>
											</div>
											<div>
												<div className="flex items-center gap-2">
													<span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-md" title={`UUID: ${category.id}`}>
														ID: {category.code || deriveCode(category.nameEn)}
													</span>
													<p className="font-semibold text-stone-900">{category.nameEn}</p>
												</div>
												<p lang="km" className="mt-1 text-sm text-muted-foreground font-medium">
													{category.nameKm}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<span className="text-xs font-semibold text-stone-500">
												{category.itemCount} items
											</span>
											<Badge variant={category.status === "active" ? "default" : "secondary"}>
												{category.status}
											</Badge>
											<Button 
												variant="outline" 
												size="sm" 
												onClick={() => setEditingCategory(category)}
												className="h-9 text-xs px-3 border-stone-200"
											>
												Edit
											</Button>
										</div>
									</div>
								);
							})}

							{items.length === 0 && (
								<div className="text-center p-12 text-muted-foreground">
									<FolderPlus className="mx-auto size-8 text-stone-300 mb-2" />
									<p className="font-semibold text-stone-850">No categories yet</p>
									<p className="text-xs text-muted-foreground mt-0.5">Create categories to structure your digital menu.</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Category Modal Overlay */}
			{editingCategory && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
					<div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
						{/* Header */}
						<div className="flex items-center justify-between border-b px-5 py-4 bg-stone-50">
							<div>
								<h3 className="font-bold text-stone-900 text-lg">Edit Category</h3>
								<p className="text-xs text-stone-500 mt-0.5">Modify category name translations, ID code, and state.</p>
							</div>
							<button 
								onClick={() => setEditingCategory(null)}
								className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 hover:bg-stone-200/50 transition-colors"
							>
								<X className="size-5" />
							</button>
						</div>

						{/* Form Content */}
						<form onSubmit={handleUpdate} className="flex flex-col flex-1 p-5 space-y-4">
							<div className="grid gap-2">
								<label htmlFor="editCode" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Category ID / Code (3 Digits / Letters)
								</label>
								<Input 
									required 
									id="editCode" 
									value={editCode} 
									onChange={(e) => setEditCode(e.target.value.toUpperCase())} 
									maxLength={10}
									className="min-h-11 font-mono uppercase font-bold text-base" 
									placeholder="e.g. DES" 
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor="editNameEn" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									English name
								</label>
								<Input 
									required 
									id="editNameEn" 
									value={editNameEn} 
									onChange={(e) => setEditNameEn(e.target.value)} 
									className="min-h-11" 
									placeholder="e.g. Desserts" 
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor="editNameKm" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Khmer name
								</label>
								<Input 
									required 
									id="editNameKm" 
									lang="km" 
									value={editNameKm} 
									onChange={(e) => setEditNameKm(e.target.value)} 
									className="min-h-11" 
									placeholder="ឧ. បង្អែម" 
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor="editStatusSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Status
								</label>
								<select
									id="editStatusSelect"
									value={editStatus}
									onChange={(e) => setEditStatus(e.target.value as "active" | "inactive")}
									className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none"
								>
									<option value="active">Active</option>
									<option value="inactive">Inactive</option>
								</select>
							</div>

							{editError && (
								<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
									<AlertCircle className="size-4 shrink-0" />
									<span>{editError}</span>
								</div>
							)}

							{/* Footer Actions */}
							<div className="flex justify-end gap-3 border-t pt-4 bg-white">
								<Button 
									type="button" 
									variant="outline" 
									onClick={() => setEditingCategory(null)} 
									className="h-11 border-stone-200"
								>
									Cancel
								</Button>
								<Button 
									type="submit" 
									className="h-11 px-6"
								>
									Save Changes
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</main>
	);
}
