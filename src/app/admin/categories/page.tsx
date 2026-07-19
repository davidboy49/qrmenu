"use client";

import { useEffect, useState } from "react";
import { Plus, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Category = {
	id: string;
	nameEn: string;
	nameKm: string;
	status: "active" | "inactive";
	itemCount: number;
};

export default function CategoriesPage() {
	const [items, setItems] = useState<Category[]>([]);
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

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

	async function save(form: FormData) {
		if (!confirm("Are you sure you want to create this category?")) return;
		setError("");
		
		const r = await fetch("/api/admin/categories", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(Object.fromEntries(form)),
		});

		if (!r.ok) {
			const body = (await r.json()) as { error?: string };
			setError(body.error || "Could not create category.");
			return;
		}

		setShow(false);
		await load();
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
						<CardDescription>A category can be used as soon as it is created.</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={save} className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="nameEn" className="text-sm font-semibold text-stone-700">
									English name
								</label>
								<Input required id="nameEn" name="nameEn" className="min-h-11" placeholder="e.g. Desserts" />
							</div>
							<div className="grid gap-2">
								<label htmlFor="nameKm" className="text-sm font-semibold text-stone-700">
									Khmer name
								</label>
								<Input required id="nameKm" name="nameKm" lang="km" className="min-h-11" placeholder="ឧ. បង្អែម" />
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
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
							<Loader2 className="size-8 animate-spin text-primary mb-2" />
							<span>Loading categories list…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{items.map((category) => (
								<div key={category.id} className="flex items-center justify-between gap-4 p-4.5 hover:bg-stone-50/30 transition-colors">
									<div>
										<p className="font-semibold text-stone-900">{category.nameEn}</p>
										<p lang="km" className="mt-1 text-sm text-muted-foreground font-medium">
											{category.nameKm}
										</p>
									</div>
									<div className="flex items-center gap-4">
										<span className="text-xs font-semibold text-stone-500">
											{category.itemCount} items
										</span>
										<Badge variant={category.status === "active" ? "default" : "secondary"}>
											{category.status}
										</Badge>
									</div>
								</div>
							))}

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
		</main>
	);
}

