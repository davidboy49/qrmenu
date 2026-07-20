"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Trash2, FileImage } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageCropperDialog from "@/components/admin/image-cropper-dialog";

type Media = {
	id: string;
	key: string;
	mimeType: string;
	byteSize: number;
	createdAt: number;
};

export default function MediaPage() {
	const [assets, setAssets] = useState<Media[]>([]);
	const [carouselIds, setCarouselIds] = useState<string[]>([]);
	const [croppingFile, setCroppingFile] = useState<File | null>(null);
	const [isCropOpen, setIsCropOpen] = useState(false);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	async function load() {
		try {
			const r = await fetch("/api/admin/media");
			if (r.ok) {
				setAssets((await r.json()) as Media[]);
			}
			const cr = await fetch("/api/admin/carousel");
			if (cr.ok) {
				setCarouselIds((await cr.json()) as string[]);
			}
		} catch (err) {
			console.error("Failed to load media assets", err);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function toggleCarousel(mediaId: string, active: boolean) {
		setCarouselIds(prev =>
			active ? [...prev, mediaId] : prev.filter(id => id !== mediaId)
		);
		try {
			const r = await fetch("/api/admin/carousel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ mediaId, active }),
			});
			if (!r.ok) {
				setCarouselIds(prev =>
					active ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
				);
			}
		} catch (err) {
			console.error("Failed to update carousel", err);
			setCarouselIds(prev =>
				active ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
			);
		}
	}

	// Triggered when file is selected from system dialogue
	function handleFileSelect(files: FileList | null) {
		const file = files?.[0];
		if (!file) return;
		setCroppingFile(file);
		setIsCropOpen(true);
	}

	// Triggered when cropper confirms the cropped WebP Blob
	async function handleUploadCropped(blob: Blob, filename: string) {
		setIsCropOpen(false);
		setCroppingFile(null);
		setPending(true);
		setError("");

		const form = new FormData();
		// Convert Blob to a File object so Next.js/Cloudflare server receives it with a valid name
		const fileToUpload = new File([blob], filename, { type: "image/webp" });
		form.append("file", fileToUpload);

		try {
			const r = await fetch("/api/admin/media", {
				method: "POST",
				body: form,
			});

			if (!r.ok) {
				const body = (await r.json()) as { error?: string };
				setError(body.error || "Could not upload image.");
				return;
			}
			await load();
		} catch (err) {
			setError("Failed to upload image. Please try again.");
		} finally {
			setPending(false);
		}
	}

	async function deleteAsset(id: string) {
		if (!confirm("Are you sure you want to delete this image?")) return;
		
		setDeletingId(id);
		try {
			const r = await fetch(`/api/admin/media/${id}`, {
				method: "DELETE",
			});
			if (r.ok) {
				await load();
			} else {
				setAssets(prev => prev.filter(a => a.id !== id));
			}
		} catch (err) {
			console.error(err);
			setAssets(prev => prev.filter(a => a.id !== id));
		} finally {
			setDeletingId(null);
		}
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Media library</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Upload and crop item photos or banners to Cloudflare R2.
				</p>
			</div>

			<Card className="border shadow-xs">
				<CardHeader>
					<CardTitle>Upload image</CardTitle>
					<CardDescription>
						Photos are automatically optimized and converted to WebP format.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 p-5 text-center hover:bg-stone-50/50 hover:border-stone-300 transition-colors">
						{pending ? (
							<div className="flex flex-col items-center gap-2 text-muted-foreground">
								<Loader2 className="size-6 animate-spin text-primary" />
								<span className="font-semibold text-sm">Uploading optimized photo...</span>
							</div>
						) : (
							<>
								<ImagePlus className="mb-2 size-6 text-primary" />
								<span className="font-semibold text-sm">Choose an image to crop</span>
								<span className="mt-1 text-xs text-muted-foreground">
									JPG, PNG, or WebP · max 5 MB
								</span>
							</>
						)}
						<input
							className="sr-only"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							disabled={pending}
							onChange={(e) => handleFileSelect(e.target.files)}
						/>
					</label>
					{error && (
						<p role="alert" className="mt-3 text-sm text-destructive font-medium">
							{error}
						</p>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{assets.map((asset) => (
					<Card key={asset.id} className="overflow-hidden border shadow-xs group">
						<CardContent className="p-4">
							<div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100 border">
								<Image
									src={`/api/media/${asset.id}`}
									alt={asset.key}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className="object-cover transition-transform duration-300 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
									<Button
										type="button"
										variant="destructive"
										size="icon"
										disabled={deletingId === asset.id}
										onClick={() => void deleteAsset(asset.id)}
										className="shadow-md"
										aria-label="Delete image"
									>
										{deletingId === asset.id ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Trash2 className="size-4" />
										)}
									</Button>
								</div>
							</div>
							<div className="mt-3 min-w-0">
								<p className="truncate font-semibold text-sm text-stone-900">
									{asset.key.split("/").at(-1)}
								</p>
								<div className="mt-1 flex items-center justify-between text-xs text-muted-foreground font-medium">
									<span>{Math.ceil(asset.byteSize / 1024)} KB</span>
									<span className="flex items-center gap-1">
										<FileImage className="size-3" />
										{asset.mimeType.split("/")[1].toUpperCase()}
									</span>
								</div>
								<div className="mt-3 pt-3 border-t flex items-center justify-between">
									<label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
										<input
											type="checkbox"
											checked={carouselIds.includes(asset.id)}
											onChange={(e) => void toggleCarousel(asset.id, e.target.checked)}
											className="rounded border-stone-300 accent-primary cursor-pointer size-4"
										/>
										<span>Show in Carousel</span>
									</label>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{assets.length === 0 && (
				<div className="text-center py-12 rounded-xl border border-dashed border-stone-200 bg-white">
					<FileImage className="mx-auto size-8 text-stone-300 mb-2" />
					<p className="text-sm font-semibold text-stone-800">No media uploaded yet</p>
					<p className="text-xs text-muted-foreground mt-0.5">
						Upload restaurant logos or food photos to get started.
					</p>
				</div>
			)}

			<ImageCropperDialog
				file={croppingFile}
				isOpen={isCropOpen}
				onClose={() => {
					setIsCropOpen(false);
					setCroppingFile(null);
				}}
				onCropped={handleUploadCropped}
			/>
		</main>
	);
}

