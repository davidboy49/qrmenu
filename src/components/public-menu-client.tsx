"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, MapPin, Search, X, Sparkles, Utensils } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu-types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface PublicMenuClientProps {
	menu: {
		restaurant: string;
		items: PublicMenuItem[];
	};
	locale: "en" | "km-KH";
	slug: string;
}

function Price({ khr, usd }: { khr: number | null; usd: number | null }) {
	return (
		<div className="text-right shrink-0">
			{khr !== null && (
				<p className="font-bold text-foreground tabular-nums text-base">
					{new Intl.NumberFormat("km-KH").format(khr)} ៛
				</p>
			)}
			{usd !== null && (
				<p className="text-sm font-medium text-muted-foreground tabular-nums mt-0.5">
					${(usd / 100).toFixed(2)}
				</p>
			)}
		</div>
	);
}

export default function PublicMenuClient({ menu, locale, slug }: PublicMenuClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>("");
	
	// Create references for category section elements to observe scrolling
	const observer = useRef<IntersectionObserver | null>(null);

	// Group and filter items
	const filteredItems = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return menu.items;

		return menu.items.filter(
			(item) =>
				item.name.toLowerCase().includes(query) ||
				(item.secondaryName && item.secondaryName.toLowerCase().includes(query)) ||
				item.category.toLowerCase().includes(query) ||
				(item.description && item.description.toLowerCase().includes(query))
		);
	}, [menu.items, searchQuery]);

	// Group filtered items by category
	const groups = useMemo(() => {
		const grouped: Record<string, PublicMenuItem[]> = {};
		for (const item of filteredItems) {
			if (!grouped[item.category]) {
				grouped[item.category] = [];
			}
			grouped[item.category].push(item);
		}
		return Object.entries(grouped).map(([category, items]) => ({
			category,
			categoryId: items[0].categoryId || encodeURIComponent(category),
			items,
		}));
	}, [filteredItems]);

	// Collect unique categories for navbar
	const categories = useMemo(() => {
		const unique: { name: string; id: string }[] = [];
		const seen = new Set<string>();
		for (const item of menu.items) {
			if (!seen.has(item.category)) {
				seen.add(item.category);
				unique.push({
					name: item.category,
					id: item.categoryId || encodeURIComponent(item.category),
				});
			}
		}
		return unique;
	}, [menu.items]);

	// Setup active category scroll detection
	useEffect(() => {
		if (searchQuery) return; // Disable scroll spy during search

		const handleScroll = () => {
			const scrollPosition = window.scrollY + 160; // offset for sticky headers

			let currentCategory = "";
			for (const cat of categories) {
				const element = document.getElementById(cat.id);
				if (element) {
					const top = element.offsetTop;
					if (scrollPosition >= top) {
						currentCategory = cat.id;
					}
				}
			}

			if (currentCategory && currentCategory !== activeCategory) {
				setActiveCategory(currentCategory);
				// Center the active tab in navigation
				const tabElement = document.getElementById(`tab-${currentCategory}`);
				if (tabElement) {
					tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
				}
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		// Set initial active category
		if (categories.length > 0 && !activeCategory) {
			setActiveCategory(categories[0].id);
		}

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [categories, activeCategory, searchQuery]);

	const scrollToCategory = (categoryId: string) => {
		setActiveCategory(categoryId);
		const element = document.getElementById(categoryId);
		if (element) {
			const yOffset = -140; // offset for headers
			const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	};

	return (
		<main className="min-h-screen bg-stone-50/50 pb-16">
			{/* Header */}
			<header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md">
				<div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<div className="flex items-center gap-1.5">
								<Sparkles className="size-3 text-primary animate-pulse" />
								<p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
									{locale === "en" ? "Digital menu" : "ម៉ឺនុយឌីជីថល"}
								</p>
							</div>
							<h1 className="mt-0.5 text-xl font-black tracking-tight text-stone-900 truncate">
								{menu.restaurant}
							</h1>
						</div>

						<Link
							href={`/menu/${slug}?lang=${locale === "en" ? "km" : "en"}`}
							className="inline-flex h-9 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-xs transition-all hover:bg-stone-50 active:scale-95 shrink-0"
						>
							<Globe className="size-3.5 text-stone-500" />
							{locale === "en" ? "ខ្មែរ" : "English"}
						</Link>
					</div>
				</div>

				{/* Sticky Category Tabs (Only show when not searching) */}
				{!searchQuery && categories.length > 0 && (
					<div className="border-t border-stone-100 bg-white/90">
						<nav
							className="mx-auto max-w-3xl flex overflow-x-auto gap-1.5 px-4 py-2.5 scrollbar-none"
							aria-label="Categories"
						>
							{categories.map((cat) => {
								const active = activeCategory === cat.id;
								return (
									<button
										key={cat.id}
										id={`tab-${cat.id}`}
										onClick={() => scrollToCategory(cat.id)}
										className={`h-8 shrink-0 rounded-full px-4 text-xs font-semibold transition-all duration-200 ${
											active
												? "bg-primary text-primary-foreground shadow-xs shadow-primary/20 scale-102"
												: "bg-stone-100 text-stone-600 hover:bg-stone-200/70"
										}`}
									>
										{cat.name}
									</button>
								);
							})}
						</nav>
					</div>
				)}
			</header>

			<div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
				{/* Welcome Hero Banner */}
				<div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-800 p-5 text-primary-foreground shadow-md shadow-primary/10">
					<div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
						<Utensils className="size-48" />
					</div>
					<p className="text-xs font-bold uppercase tracking-wider opacity-85">
						{locale === "en" ? "Welcome to our table" : "សូមស្វាគមន៍មកកាន់តុរបស់អ្នក"}
					</p>
					<p className="mt-1 text-lg font-bold">
						{locale === "en" ? "Fresh Khmer flavours, served today." : "រសជាតិខ្មែរស្រស់ៗ សម្រាប់ថ្ងៃនេះ។"}
					</p>
					<div className="mt-3 flex items-center gap-1.5 text-xs font-semibold bg-white/10 w-fit px-2.5 py-1 rounded-full backdrop-blur-xs">
						<MapPin className="size-3.5" />
						{locale === "en" ? "Main dining room" : "បន្ទប់ទទួលទានអាហារធំ"}
					</div>
				</div>

				{/* Search Bar */}
				<div className="relative mb-6">
					<Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={locale === "en" ? "Search dishes, drinks..." : "ស្វែងរកមុខម្ហូប ភេសជ្ជៈ..."}
						className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm shadow-xs transition-all placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-hidden"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
							aria-label="Clear search"
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				{/* Menu List */}
				<div className="space-y-8">
					{groups.map((group) => (
						<section
							key={group.category}
							id={group.categoryId}
							className="scroll-mt-[135px]"
						>
							<h2 className="mb-3 text-base font-bold text-stone-800 px-1 flex items-center gap-2">
								<span className="inline-block size-1.5 rounded-full bg-primary" />
								{group.category}
								<span className="text-xs font-normal text-stone-400">({group.items.length})</span>
							</h2>
							<div className="grid gap-3 sm:grid-cols-2">
								{group.items.map((item) => (
									<article
										key={item.id}
										onClick={() => setSelectedItem(item)}
										className="flex gap-3.5 p-3 rounded-xl border border-stone-150 bg-white hover:border-primary/30 active:bg-stone-50 cursor-pointer shadow-xs transition-all duration-200"
									>
										{item.imageId ? (
											<div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
												<Image
													src={`/api/media/${item.imageId}`}
													alt={item.name}
													fill
													sizes="80px"
													className="object-cover"
												/>
											</div>
										) : (
											<div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-primary/5 font-black text-primary text-lg">
												{item.name.slice(0, 2).toUpperCase()}
											</div>
										)}
										<div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
											<div>
												<h3 className="font-semibold text-stone-900 leading-snug line-clamp-1">
													{item.name}
												</h3>
												{item.secondaryName && (
													<p
														lang={locale === "en" ? "km" : "en"}
														className="text-xs text-muted-foreground mt-0.5 truncate font-medium"
													>
														{item.secondaryName}
													</p>
												)}
											</div>
											<div className="mt-1 flex items-baseline justify-between gap-2">
												<p className="text-xs text-muted-foreground line-clamp-1 pr-2">
													{item.description}
												</p>
												<Price khr={item.priceKhr} usd={item.priceUsd} />
											</div>
										</div>
									</article>
								))}
							</div>
						</section>
					))}

					{groups.length === 0 && (
						<div className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-500">
							<Utensils className="mx-auto size-10 text-stone-300 mb-3" />
							<p className="font-semibold text-stone-800">
								{locale === "en" ? "No items match your search" : "មិនមានមុខម្ហូបត្រូវនឹងការស្វែងរករបស់អ្នកទេ"}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{locale === "en"
									? "Try searching for a different dish name or category."
									: "សូមសាកល្បងស្វែងរកឈ្មោះម្ហូប ឬប្រភេទផ្សេងទៀត។"}
							</p>
							<Button
								variant="outline"
								onClick={() => setSearchQuery("")}
								className="mt-4"
								size="sm"
							>
								{locale === "en" ? "Clear Search" : "សម្អាតការស្វែងរក"}
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Interactive Slide-up bottom sheet Detail View */}
			<Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
				<SheetContent side="bottom" className="sm:max-w-md sm:mx-auto sm:rounded-t-3xl overflow-hidden p-0 max-h-[85vh] outline-hidden">
					{selectedItem && (
						<div className="flex flex-col h-full bg-white">
							{/* Drag handle decoration */}
							<div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-stone-200" />
							
							<div className="overflow-y-auto px-5 pb-6">
								{selectedItem.imageId ? (
									<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-100 shadow-inner">
										<Image
											src={`/api/media/${selectedItem.imageId}`}
											alt={selectedItem.name}
											fill
											className="object-cover"
											priority
										/>
									</div>
								) : (
									<div className="flex aspect-video w-full items-center justify-center rounded-xl bg-primary/5 font-black text-primary text-4xl">
										{selectedItem.name.slice(0, 2).toUpperCase()}
									</div>
								)}

								<div className="mt-5">
									<div className="flex items-start justify-between gap-4">
										<div>
											<span className="inline-block rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold text-stone-600 uppercase tracking-wide">
												{selectedItem.category}
											</span>
											<h2 className="mt-2 text-xl font-bold text-stone-900 leading-tight">
												{selectedItem.name}
											</h2>
											{selectedItem.secondaryName && (
												<p
													lang={locale === "en" ? "km" : "en"}
													className="mt-1 text-sm font-semibold text-primary"
												>
													{selectedItem.secondaryName}
												</p>
											)}
										</div>
										<div className="bg-stone-50 border p-2.5 rounded-xl text-right">
											<Price khr={selectedItem.priceKhr} usd={selectedItem.priceUsd} />
										</div>
									</div>

									{selectedItem.description && (
										<div className="mt-5 border-t pt-4">
											<h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
												{locale === "en" ? "Description" : "ការពិពណ៌នា"}
											</h4>
											<p className="mt-1.5 text-sm leading-relaxed text-stone-600 font-medium">
												{selectedItem.description}
											</p>
										</div>
									)}
									
									<div className="mt-8 flex justify-center">
										<Button
											onClick={() => setSelectedItem(null)}
											className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/10"
										>
											{locale === "en" ? "Back to Menu" : "ត្រឡប់ទៅបញ្ជីមុខម្ហូបវិញ"}
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</main>
	);
}
