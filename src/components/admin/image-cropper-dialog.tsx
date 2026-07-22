"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { X, Crop as CropIcon, Image as ImageIcon } from "lucide-react";

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
			setCompletedCrop(initialCrop as unknown as PixelCrop);
		} else {
			const initialCrop: Crop = {
				unit: "%",
				x: 10,
				y: 10,
				width: 80,
				height: 80,
			};
			setCrop(initialCrop);
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
			} as Crop);
		}
	};

	// Generate and export optimized webp blob
	const handleCropConfirm = async () => {
		if (!imgRef.current) return;

		const image = imgRef.current;
		const cropToUse = completedCrop || (crop as PixelCrop);
		if (!cropToUse || !cropToUse.width || !cropToUse.height) return;

		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;

		// Limit resolutions for optimization
		let targetWidth = cropToUse.width * scaleX;
		let targetHeight = cropToUse.height * scaleY;

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
			cropToUse.x * scaleX,
			cropToUse.y * scaleY,
			cropToUse.width * scaleX,
			cropToUse.height * scaleY,
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

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
			onClick={onClose}
		>
			<div 
				className="relative bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b px-6 py-4 bg-stone-50/80 flex-shrink-0">
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-stone-900 text-stone-50">
							<CropIcon className="size-4" />
						</div>
						<div>
							<h3 className="text-base font-bold text-stone-900 leading-tight">Crop and Optimize Media</h3>
							<p className="text-xs text-stone-500 mt-0.5">Select crop aspect ratio preset, crop, and convert to space-saving WebP.</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="text-stone-400 hover:text-stone-700 rounded-lg p-1.5 hover:bg-stone-200/60 transition-colors"
					>
						<X className="size-5" />
					</button>
				</div>

				{/* Aspect ratio controls */}
				<div className="px-6 pt-4 flex flex-wrap gap-2 flex-shrink-0">
					<Button
						type="button"
						variant={aspectPreset === "1:1" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("1:1")}
						className="text-xs h-8"
					>
						Menu Item (1:1)
					</Button>
					<Button
						type="button"
						variant={aspectPreset === "21:9" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("21:9")}
						className="text-xs h-8"
					>
						Carousel Banner (21:9)
					</Button>
					<Button
						type="button"
						variant={aspectPreset === "free" ? "default" : "outline"}
						size="sm"
						onClick={() => handlePresetChange("free")}
						className="text-xs h-8"
					>
						Free Crop
					</Button>
				</div>

				{/* Crop container */}
				<div className="p-6 flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden">
					<div className="w-full h-full max-h-[420px] min-h-[260px] bg-stone-950/90 rounded-xl border border-stone-800 p-4 flex items-center justify-center overflow-hidden">
						{imgSrc ? (
							<ReactCrop
								crop={crop}
								onChange={(c) => setCrop(c)}
								onComplete={(c) => setCompletedCrop(c)}
								aspect={aspectPreset === "free" ? undefined : (aspectPreset === "1:1" ? 1 : 21 / 9)}
								className="max-h-full max-w-full inline-flex items-center justify-center"
							>
								<img
									ref={imgRef}
									alt="Crop source"
									src={imgSrc}
									onLoad={onImageLoad}
									className="max-h-[380px] max-w-full object-contain block select-none"
								/>
							</ReactCrop>
						) : (
							<div className="text-stone-400 text-xs flex items-center gap-2">
								<ImageIcon className="size-4" />
								<span>Loading image...</span>
							</div>
						)}
					</div>
				</div>

				{/* Footer buttons */}
				<div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-stone-50/80 flex-shrink-0">
					<Button type="button" variant="outline" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button type="button" size="sm" onClick={handleCropConfirm}>
						Apply and Upload
					</Button>
				</div>
			</div>
		</div>
	);
}
