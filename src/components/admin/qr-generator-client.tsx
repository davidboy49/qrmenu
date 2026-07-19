"use client";

import { useState, useEffect } from "react";
import { 
	QrCode, 
	Printer, 
	Info, 
	Sparkles,
	Sliders,
	ExternalLink,
	MapPin,
	Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QRGeneratorClientProps {
	activeContext: {
		restaurantId: string;
		branchId: string;
		restaurantName: string;
		restaurantSlug: string;
		branchName: string;
		branchSlug: string;
	};
}

export default function QRGeneratorClient({ activeContext }: QRGeneratorClientProps) {
	const [tableNo, setTableNo] = useState("");
	const [theme, setTheme] = useState("minimalist"); // minimalist, emerald, stone, dark
	const [size, setSize] = useState("medium"); // small, medium, large
	const [origin, setOrigin] = useState("http://localhost:3000");

	useEffect(() => {
		if (typeof window !== "undefined") {
			setOrigin(window.location.origin);
		}
	}, []);

	// Construct target destination URL
	const queryParams = new URLSearchParams();
	queryParams.set("branch", activeContext.branchSlug);
	if (tableNo.trim()) {
		queryParams.set("table", tableNo.trim());
	}
	const targetUrl = `${origin}/menu/${activeContext.restaurantSlug}?${queryParams.toString()}`;
	const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}`;

	// Sizing configuration (in printing css / preview layout)
	const sizeClasses = {
		small: "max-w-xs", // 10cm approx
		medium: "max-w-sm", // 15cm approx
		large: "max-w-md", // 20cm approx
	};

	// Theme color styling templates
	const themeStyles = {
		minimalist: {
			cardBg: "bg-white border border-stone-200 text-stone-900",
			qrFrame: "bg-stone-50 border border-stone-100",
			accentText: "text-stone-500",
			titleFont: "font-serif text-2xl font-black",
			badge: "bg-stone-100 text-stone-700",
		},
		emerald: {
			cardBg: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200 text-emerald-950 shadow-emerald-50/50 shadow-lg",
			qrFrame: "bg-gradient-to-tr from-emerald-100/50 to-teal-100/50 border border-emerald-100",
			accentText: "text-emerald-700 font-bold",
			titleFont: "font-sans text-2xl font-extrabold tracking-tight",
			badge: "bg-emerald-100 text-emerald-800",
		},
		stone: {
			cardBg: "bg-amber-50/60 border border-stone-300 text-stone-900",
			qrFrame: "bg-white border border-stone-200",
			accentText: "text-stone-600",
			titleFont: "font-serif text-2xl font-bold italic",
			badge: "bg-stone-200 text-stone-850",
		},
		dark: {
			cardBg: "bg-stone-900 border border-stone-800 text-stone-100 shadow-xl",
			qrFrame: "bg-white p-3 rounded-2xl", // Keep QR background light for easy scanning
			accentText: "text-stone-400 font-medium",
			titleFont: "font-sans text-2xl font-black tracking-tight text-white",
			badge: "bg-stone-800 text-stone-200 border border-stone-700",
		}
	};

	const currentTheme = themeStyles[theme as keyof typeof themeStyles] || themeStyles.minimalist;

	function triggerPrint() {
		window.print();
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			{/* CSS Print Overrides */}
			<style dangerouslySetInnerHTML={{ __html: `
				@media print {
					/* Hide all dashboard/backoffice wrapper layout UI */
					div[data-sidebar="sidebar"],
					header,
					button,
					nav,
					.no-print,
					.sidebar-trigger {
						display: none !important;
					}
					
					/* Flatten parent layouts to prevent clipping */
					html, body, [data-sidebar="wrapper"], main, div {
						background: white !important;
						color: black !important;
						height: auto !important;
						min-height: auto !important;
						overflow: visible !important;
						margin: 0 !important;
						padding: 0 !important;
						border: none !important;
						box-shadow: none !important;
						display: block !important;
						width: 100% !important;
					}
					
					/* Isolate and center target flyer container */
					#print-area {
						display: block !important;
						margin: 2cm auto !important;
						padding: 3rem !important;
						width: 100% !important;
						max-width: 440px !important;
						border: 1px solid #e5e7eb !important;
						border-radius: 1.5rem !important;
						background-color: white !important;
						box-shadow: none !important;
						page-break-inside: avoid !important;
					}
				}
			`}} />

			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between no-print">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 text-stone-900">
						<QrCode className="size-8 text-primary" />
						Customer QR Code
					</h1>
					<p className="mt-1 text-sm text-stone-500">
						Generate and print table-tents or display flyers for customers to scan and access your digital menu.
					</p>
				</div>
				<Button onClick={triggerPrint} className="min-h-11 shrink-0 px-5 shadow-xs">
					<Printer className="size-4 mr-1.5" />
					Print QR Code
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Controls Side Panel */}
				<div className="lg:col-span-1 space-y-5 no-print">
					<Card className="border border-stone-200 bg-white shadow-xs">
						<CardHeader className="pb-4">
							<CardTitle className="text-base flex items-center gap-2">
								<Sliders className="size-4.5 text-primary" />
								Customization
							</CardTitle>
							<CardDescription>Configure and style the printed output flyer.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Table Number */}
							<div className="grid gap-1.5">
								<label htmlFor="tableNo" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Table Number (Optional)
								</label>
								<Input
									id="tableNo"
									value={tableNo}
									onChange={(e) => setTableNo(e.target.value)}
									placeholder="e.g. Table 5"
									className="min-h-10 text-sm"
								/>
								<span className="text-[10px] text-stone-400">
									If entered, scanning redirects directly to this table context.
								</span>
							</div>

							{/* Sizing presets */}
							<div className="grid gap-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Print Size Preset
								</label>
								<div className="grid grid-cols-3 gap-2">
									{["small", "medium", "large"].map((s) => (
										<button
											key={s}
											onClick={() => setSize(s)}
											className={`h-9 rounded-lg border text-xs font-bold capitalize transition-colors ${
												size === s
													? "bg-primary border-primary text-primary-foreground"
													: "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
											}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>

							{/* Theme selection */}
							<div className="grid gap-1.5">
								<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Design Style Theme
								</label>
								<div className="grid grid-cols-2 gap-2">
									{[
										{ id: "minimalist", label: "Minimalist" },
										{ id: "emerald", label: "Modern Emerald" },
										{ id: "stone", label: "Warm Stone" },
										{ id: "dark", label: "Sleek Dark" },
									].map((t) => (
										<button
											key={t.id}
											onClick={() => setTheme(t.id)}
											className={`h-10 rounded-lg border text-xs font-bold transition-all ${
												theme === t.id
													? "bg-stone-900 border-stone-900 text-white shadow-xs"
													: "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
											}`}
										>
											{t.label}
										</button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Scan Details Info card */}
					<Card className="border border-stone-200 bg-white shadow-xs">
						<CardContent className="p-4 space-y-3.5">
							<div className="flex gap-2 items-start text-xs leading-relaxed text-stone-600">
								<Info className="size-4 text-primary shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-stone-850">Destination URL info</p>
									<p className="mt-0.5">Scanning this QR code directs customers to:</p>
									<code className="mt-1.5 block bg-stone-50 p-2 border border-stone-200 rounded font-mono text-[10px] break-all select-all">
										{targetUrl}
									</code>
								</div>
							</div>
							<a 
								href={targetUrl} 
								target="_blank" 
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
							>
								Preview Customer View
								<ExternalLink className="size-3" />
							</a>
						</CardContent>
					</Card>
				</div>

				{/* Preview Area */}
				<div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-stone-100/50 rounded-2xl border border-stone-200 min-h-[500px]">
					<span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 no-print flex items-center gap-1.5">
						<Sparkles className="size-3.5 text-primary" />
						Live Print Preview
					</span>
					
					{/* Printable Card Container */}
					<div 
						id="print-area"
						className={`w-full ${sizeClasses[size as keyof typeof sizeClasses]} p-8 rounded-2xl shadow-md flex flex-col items-center text-center transition-all duration-300 ${currentTheme.cardBg}`}
					>
						{/* Header brand details */}
						<div className="mb-4">
							<div className="flex items-center justify-center gap-1.5">
								<Building2 className="size-4" />
								<span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
									{activeContext.restaurantName}
								</span>
							</div>
							<h2 className={`mt-2 ${currentTheme.titleFont}`}>
								{activeContext.restaurantName}
							</h2>
							<div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${currentTheme.badge}`}>
								<MapPin className="size-3" />
								{activeContext.branchName} Location
							</div>
						</div>

						{/* QR Code Graphic Frame */}
						<div className={`my-4 p-4 rounded-xl flex items-center justify-center aspect-square w-52 shrink-0 ${currentTheme.qrFrame}`}>
							<img 
								src={qrCodeApiUrl} 
								alt={`Menu QR Code for ${activeContext.restaurantName} - ${activeContext.branchName}`} 
								className="w-full h-full object-contain select-none"
							/>
						</div>

						{/* Footer instructions */}
						<div className="mt-2 space-y-1">
							{tableNo.trim() && (
								<p className="text-base font-extrabold tracking-tight">
									{tableNo.trim()}
								</p>
							)}
							<p className="text-sm font-bold tracking-tight">
								Scan to View Digital Menu
							</p>
							<p className={`text-[10px] ${currentTheme.accentText}`}>
								No App Required • Open Camera & Point
							</p>
						</div>
					</div>
					
					<p className="text-xs text-stone-400 mt-5 text-center no-print">
						Print margins, card size, and layout optimize automatically for paper orientation.
					</p>
				</div>
			</div>
		</main>
	);
}
