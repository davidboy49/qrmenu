"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ImageCropperDialogProps {
	file: File | null;
	isOpen: boolean;
	onClose: () => void;
	onCropped: (croppedBlob: Blob, filename: string) => void;
}

type AspectPreset = "1:1" | "21:9" | "free";

export default function ImageCropperDialog({ file, isOpen, onClose, onCropped }: ImageCropperDialogProps) {
	const [imgSrc, setImgSrc] = useState("");
	const [crop, setCrop] = useState<Crop>();
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
	const [aspectPreset, setAspectPreset] = useState<AspectPreset>("1:1");
	const imgRef = useRef<HTMLImageElement>(null);

	// Load image source when file is provided
	React.useEffect(() => {
		if (!file) {
			setImgSrc("");
			return;
		}
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			setImgSrc(reader.result?.toString() || "");
		});
		reader.readAsDataURL(file);
	}, [file]);

	// Initial default crop centered
	function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
		const { width, height } = e.currentTarget;
		let aspect = 1;
		if (aspectPreset === "21:9") aspect = 21 / 9;
		
		if (aspectPreset !== "free") {
			const initialCrop = centerCrop(
				makeAspectCrop(
					{
						unit: "%",
						width: 90,
					},
					aspect,
					width,
					height
				),
				width,
				height
			);
			setCrop(initialCrop);
		} else {
			setCrop({
				unit: "%",
				x: 10,
				y: 10,
				width: 80,
				height: 80,
			});
		}
	}

	// Preset change callback
	const handlePresetChange = (preset: AspectPreset) => {
		setAspectPreset(preset);
		if (!imgRef.current) return;
		const { width, height } = imgRef.current;
		
		let aspect = 1;
		if (preset === "21:9") aspect = 21 / 9;

		if (preset !== "free") {
			const newCrop = centerCrop(
				makeAspectCrop(
					{
						unit: "%",
						width: 90,
					},
					aspect,
					width,
					height
				),
				width,
				height
			);
			setCrop(newCrop);
		} else {
			setCrop({
				unit: "%",
				x: 10,
				y: 10,
				width: 80,
				height: 80,
			});
		}
	};

	// Generate and export optimized webp blob
	const handleCropConfirm = async () => {
		if (!imgRef.current || !completedCrop) return;

		const image = imgRef.current;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		// Limit resolutions for optimization
		let targetWidth = completedCrop.width * scaleX;
		let targetHeight = completedCrop.height * scaleY;

		if (aspectPreset === "1:1" && targetWidth > 600) {
			targetWidth = 600;
			targetHeight = 600;
		} else if (aspectPreset === "21:9" && targetWidth > 1200) {
			targetWidth = 1200;
			targetHeight = 512;
		}

		canvas.width = targetWidth;
		canvas.height = targetHeight;

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";

		ctx.drawImage(
			image,
			completedCrop.x * scaleX,
			completedCrop.y * scaleY,
			completedCrop.width * scaleX,
			completedCrop.height * scaleY,
			0,
			0,
			targetWidth,
			targetHeight
		);

		canvas.toBlob(
			(blob) => {
				if (blob && file) {
					// Output in WebP format
					const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
					onCropped(blob, `${baseName}_cropped.webp`);
				}
			},
			"image/webp",
			0.85 // High quality compression
		);
	};

	return (
		<Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
			<SheetContent side="bottom" className="h-[90vh] md:h-[80vh] flex flex-col p-6 rounded-t-2xl">
				<div className="flex flex-col gap-1">
					<h3 className="text-lg font-semibold text-stone-900">Crop and Optimize Media</h3>
					<p className="text-xs text-muted-foreground">Select crop aspect ratio preset, crop, and convert to space-saving WebP.</p>
				</div>

				{/* Aspect ratio controls */}
				<div className="flex gap-2 my-4">
					<Button
						type="button"
						variant={aspectPreset === "1:1" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("1:1")}
					>
						Menu Item (1:1)
					</Button>
					<Button
						type="button"
						variant={aspectPreset === "21:9" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("21:9")}
					>
						Carousel Banner (21:9)
					</Button>
					<Button
						type="button"
						variant={aspectPreset === "free" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("free")}
					>
						Free Crop
					</Button>
				</div>

				{/* Crop container */}
				<div className="flex-1 min-h-0 w-full overflow-auto flex items-center justify-center bg-stone-50 rounded-lg border p-4">
					{imgSrc && (
						<ReactCrop
							crop={crop}
							onChange={(c) => setCrop(c)}
							onComplete={(c) => setCompletedCrop(c)}
							aspect={aspectPreset === "free" ? undefined : (aspectPreset === "1:1" ? 1 : 21 / 9)}
							className="max-h-full"
						>
							<img
								ref={imgRef}
								alt="Crop source"
								src={imgSrc}
								onLoad={onImageLoad}
								className="max-h-[50vh] object-contain"
							/>
						</ReactCrop>
					)}
				</div>

				{/* Footer buttons */}
				<div className="flex justify-end gap-3 mt-6 pt-4 border-t">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="button" onClick={handleCropConfirm}>
						Apply and Upload
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
