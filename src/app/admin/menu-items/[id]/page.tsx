"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Item = {
	id: string;
	nameEn: string;
	nameKm: string;
	priceKhr: number;
	priceUsd: number;
	status: "active" | "inactive";
	imageId?: string | null;
};

type Media = {
	id: string;
	key: string;
};

export default function EditMenuItemPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [item, setItem] = useState<Item>();
	const [media, setMedia] = useState<Media[]>([]);
	const [imageId, setImageId] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	useEffect(() => {
		Promise.all([
			fetch(`/api/admin/menu-items/${id}`),
			fetch("/api/admin/media")
		])
			.then(async ([itemResponse, mediaResponse]) => {
				if (!itemResponse.ok) throw new Error();
				const itemData = (await itemResponse.json()) as Item;
				setItem(itemData);
				setImageId(itemData.imageId ?? null);
				setMedia((await mediaResponse.json()) as Media[]);
			})
			.catch(() => setError("This menu item could not be found."));
	}, [id]);

	async function submit(form: FormData) {
		if (!confirm("Are you sure you want to save these changes?")) return;
		setPending(true);
		setError("");
		const raw = Object.fromEntries(form);
		
		// In NextJS Form actions, hidden input values are read.
		// Our ImageUpload outputs imageId to form data directly.
		const response = await fetch(`/api/admin/menu-items/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...raw,
				imageId: imageId || null,
			}),
		});

		setPending(false);

		if (!response.ok) {
			setError("Could not save changes.");
			return;
		}

		router.push("/admin/menu-items");
		router.refresh();
	}

	if (!item) {
		return (
			<main className="flex min-h-screen items-center justify-center p-8 text-muted-foreground">
				{error ? (
					<p role="alert" className="text-destructive font-semibold">{error}</p>
				) : (
					<div className="flex flex-col items-center gap-2">
						<Loader2 className="size-8 animate-spin text-primary" />
						<span>Loading menu item…</span>
					</div>
				)}
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex items-start gap-3">
				<Button
					variant="outline"
					size="icon"
					render={<Link href="/admin/menu-items" aria-label="Back to menu items" />}
					className="size-10 shrink-0"
				>
					<ArrowLeft />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Edit menu item</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						An item must be active and included in a current schedule to appear on the QR menu.
					</p>
				</div>
			</div>

			<Card className="max-w-3xl border shadow-xs">
				<CardHeader>
					<CardTitle>{item.nameEn}</CardTitle>
					<CardDescription>Update item details, image, and customer visibility.</CardDescription>
				</CardHeader>
				<CardContent>
					<form action={submit} className="grid gap-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-stone-700" htmlFor="nameEn">
									English name
								</label>
								<Input
									id="nameEn"
									name="nameEn"
									required
									defaultValue={item.nameEn}
									className="min-h-11"
								/>
							</div>
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-stone-700" htmlFor="nameKm">
									Khmer name
								</label>
								<Input
									id="nameKm"
									name="nameKm"
									required
									defaultValue={item.nameKm}
									lang="km"
									className="min-h-11"
								/>
							</div>
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-stone-700" htmlFor="priceKhr">
									Price in KHR
								</label>
								<Input
									id="priceKhr"
									name="priceKhr"
									required
									defaultValue={item.priceKhr}
									inputMode="numeric"
									className="min-h-11"
								/>
							</div>
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-stone-700" htmlFor="priceUsd">
									Price in USD
								</label>
								<Input
									id="priceUsd"
									name="priceUsd"
									required
									defaultValue={item.priceUsd}
									inputMode="decimal"
									className="min-h-11"
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 border-t pt-5">
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-stone-700">Primary photo</label>
								<ImageUpload value={imageId} onChange={setImageId} name="imageId" />
							</div>

							<div className="flex flex-col gap-5 justify-between">
								<div className="grid gap-2">
									<label className="text-sm font-semibold text-stone-700" htmlFor="imageIdSelect">
										Or choose existing photo
									</label>
									<Select
										value={imageId || "none"}
										onValueChange={(val) => setImageId(val === "none" ? null : val)}
									>
										<SelectTrigger className="w-full h-11" id="imageIdSelect">
											<SelectValue placeholder="No photo selected" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">No photo</SelectItem>
											{media.map((asset) => (
												<SelectItem key={asset.id} value={asset.id}>
													{asset.key.split("/").at(-1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<fieldset className="grid gap-2.5">
									<legend className="text-sm font-semibold text-stone-700">Visibility</legend>
									<div className="flex gap-5 mt-1">
										<label className="flex items-center gap-2.5 text-sm font-medium text-stone-600 cursor-pointer select-none">
											<input
												type="radio"
												name="status"
												value="active"
												defaultChecked={item.status === "active"}
												className="size-4.5 accent-primary border-stone-300 cursor-pointer"
											/>
											<span>Active</span>
										</label>
										<label className="flex items-center gap-2.5 text-sm font-medium text-stone-600 cursor-pointer select-none">
											<input
												type="radio"
												name="status"
												value="inactive"
												defaultChecked={item.status === "inactive"}
												className="size-4.5 accent-primary border-stone-300 cursor-pointer"
											/>
											<span>Inactive</span>
										</label>
									</div>
								</fieldset>
							</div>
						</div>

						{error && (
							<p role="alert" className="text-sm text-destructive font-medium">
								{error}
							</p>
						)}

						<div className="flex justify-end gap-3 border-t pt-5">
							<Button
								variant="outline"
								render={<Link href="/admin/menu-items" />}
								className="h-11"
								onClick={(e) => {
									if (!confirm("Are you sure you want to discard your changes?")) {
										e.preventDefault();
									}
								}}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={pending} className="h-11">
								{pending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-1" />
										Saving…
									</>
								) : (
									"Save changes"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}

