"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";

export default function NewMenuItemPage() {
	const router = useRouter();
	const [imageId, setImageId] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function submit(form: FormData) {
		if (!confirm("Are you sure you want to create this menu item?")) return;
		setPending(true);
		setError("");
		const raw = Object.fromEntries(form);
		
		const response = await fetch("/api/admin/menu-items", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...raw,
				imageId: imageId || null,
			}),
		});

		setPending(false);

		if (!response.ok) {
			const body = (await response.json()) as { error?: string };
			setError(body.error || "Could not save item.");
			return;
		}

		router.push("/admin/menu-items");
		router.refresh();
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex items-start gap-3">
				<Button
					variant="outline"
					size="icon"
					nativeButton={false}
					render={<Link href="/admin/menu-items" aria-label="Back to menu items" />}
					className="size-10 shrink-0"
				>
					<ArrowLeft aria-hidden="true" />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Create menu item</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						New items stay hidden until active and scheduled.
					</p>
				</div>
			</div>

			<Card className="max-w-3xl border shadow-xs">
				<CardHeader>
					<CardTitle>Basic information</CardTitle>
					<CardDescription>Provide Khmer and English names for all guests.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={submit} className="grid gap-6">
						<div className="grid gap-2">
							<label htmlFor="name-en" className="text-sm font-semibold text-stone-700">
								English name
							</label>
							<Input
								required
								id="name-en"
								name="nameEn"
								placeholder="e.g. Fish Amok"
								className="min-h-11"
							/>
						</div>
						
						<div className="grid gap-2">
							<label htmlFor="name-km" className="text-sm font-semibold text-stone-700">
								Khmer name
							</label>
							<Input
								required
								id="name-km"
								name="nameKm"
								lang="km"
								placeholder="ឧ. អាម៉ុកត្រី"
								className="min-h-11"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="price-khr" className="text-sm font-semibold text-stone-700">
									Price in KHR
								</label>
								<Input
									required
									id="price-khr"
									name="priceKhr"
									inputMode="numeric"
									placeholder="28000"
									className="min-h-11"
								/>
							</div>
							<div className="grid gap-2">
								<label htmlFor="price-usd" className="text-sm font-semibold text-stone-700">
									Price in USD
								</label>
								<Input
									required
									id="price-usd"
									name="priceUsd"
									inputMode="decimal"
									placeholder="7.00"
									className="min-h-11"
								/>
							</div>
						</div>

						<div className="grid gap-2 border-t pt-5">
							<label className="text-sm font-semibold text-stone-700">Primary photo</label>
							<ImageUpload value={imageId} onChange={setImageId} name="imageId" />
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive font-medium">
								{error}
							</p>
						)}

						<div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
							<Button
								variant="outline"
								nativeButton={false}
								render={<Link href="/admin/menu-items" />}
								className="min-h-11"
								onClick={(e) => {
									if (!confirm("Are you sure you want to discard this new item?")) {
										e.preventDefault();
									}
								}}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={pending} className="min-h-11">
								{pending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-1" />
										Saving…
									</>
								) : (
									"Create item"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}

