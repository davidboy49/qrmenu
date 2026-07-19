"use client";

import React, { useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
	value?: string | null;
	onChange: (value: string | null) => void;
	name?: string;
}

export function ImageUpload({ value, onChange, name = "imageId" }: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");
	const [isDragOver, setIsDragOver] = useState(false);

	async function handleUpload(file: File) {
		if (!file) return;

		setUploading(true);
		setError("");

		const form = new FormData();
		form.append("file", file);

		try {
			const res = await fetch("/api/admin/media", {
				method: "POST",
				body: form,
			});

			if (!res.ok) {
				const body = await res.json() as { error?: string };
				throw new Error(body.error || "Failed to upload image.");
			}

			const data = await res.json() as { id: string };
			onChange(data.id);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error uploading image.");
		} finally {
			setUploading(false);
		}
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (files && files.length > 0) {
			void handleUpload(files[0]);
		}
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(true);
	}

	function handleDragLeave(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(false);
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		setIsDragOver(false);
		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith("image/")) {
				void handleUpload(file);
			} else {
				setError("Please drop a valid image file.");
			}
		}
	}

	function handleRemove() {
		onChange(null);
	}

	return (
		<div className="space-y-3">
			<input type="hidden" name={name} value={value || ""} />

			{value ? (
				<div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border bg-muted shadow-sm group">
					<Image
						src={`/api/media/${value}`}
						alt="Menu item photo"
						fill
						className="object-cover transition-transform duration-300 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
						<Button
							type="button"
							variant="destructive"
							size="icon"
							onClick={handleRemove}
							className="shadow-md"
							aria-label="Remove image"
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				</div>
			) : (
				<label
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`flex aspect-[4/3] w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed transition-all duration-200 ${
						isDragOver
							? "border-primary bg-primary/5 scale-[0.99] ring-2 ring-primary/20"
							: "border-border hover:bg-muted/50 hover:border-muted-foreground/50"
					}`}
				>
					{uploading ? (
						<div className="flex flex-col items-center gap-2 text-muted-foreground">
							<Loader2 className="size-8 animate-spin text-primary" />
							<span className="text-sm font-medium animate-pulse">Uploading to R2...</span>
						</div>
					) : (
						<div className="flex flex-col items-center p-6 text-center">
							<div className="mb-3 rounded-full bg-primary/10 p-3 text-primary transition-colors hover:bg-primary/20">
								<ImagePlus className="size-6" />
							</div>
							<span className="font-semibold text-sm">Upload a photo</span>
							<span className="mt-1 text-xs text-muted-foreground">
								Drag and drop, or click to browse
							</span>
							<span className="mt-2 text-[10px] text-muted-foreground/80 font-medium">
								JPG, PNG, WebP · Max 5MB
							</span>
						</div>
					)}
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						className="sr-only"
						disabled={uploading}
						onChange={handleFileChange}
					/>
				</label>
			)}

			{error && <p className="text-xs font-medium text-destructive">{error}</p>}
		</div>
	);
}
