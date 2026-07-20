"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Search, X, ChefHat, MapPin, ArrowLeft, Star, Sun, Moon } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu-types";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface PublicMenuClientProps {
  menu: {
    restaurant: string;
    branchName: string;
    items: PublicMenuItem[];
    carousel?: string[];
  };
  locale: "en" | "km-KH";
  slug: string;
  isAdmin?: boolean;
}

/* ─── Color Themes ────────────────────────────── */
const themes = {
  dark: {
    bg: "#121212",
    dark: "#FAF7F2", // Cream text
    card: "#1C1C1E", // Dark gray card background
    gold: "#C9A96E", // Premium gold accent
    green: "#34D399", // Emerald green for high contrast
    muted: "rgba(250, 247, 242, 0.55)",
    border: "rgba(255, 255, 255, 0.08)",
    softBg: "rgba(255, 255, 255, 0.04)",
    cardShadow: "0 4px 20px rgba(0,0,0,0.5)",
    cardHoverShadow: "0 12px 32px rgba(0,0,0,0.7)",
  },
  light: {
    bg: "#F9FAFB",
    dark: "#111827", // Charcoal text
    card: "#FFFFFF", // Pure white card background
    gold: "#C9A96E", // Premium gold accent
    green: "#1B4332", // Deep emerald green
    muted: "#4B5563",
    border: "#E5E7EB",
    softBg: "#F3F4F6",
    cardShadow: "0 4px 12px rgba(0,0,0,0.03)",
    cardHoverShadow: "0 12px 28px rgba(0,0,0,0.08)",
  }
};

const scrollContainerToChild = (container: HTMLDivElement | null, childId: string) => {
  if (!container) return;
  const child = document.getElementById(childId);
  if (!child) return;
  
  const containerRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  
  const childLeft = childRect.left - containerRect.left + container.scrollLeft;
  const targetScrollLeft = childLeft - containerRect.width / 2 + childRect.width / 2;
  
  container.scrollTo({
    left: targetScrollLeft,
    behavior: "smooth"
  });
};

export default function PublicMenuClient({ menu, locale, slug, isAdmin = false }: PublicMenuClientProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const circleTabsRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("menu-theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("menu-theme", next);
  };

  const isDark = theme === "dark";
  const T = isDark ? themes.dark : themes.light;

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: { name: string; id: string }[] = [];
    for (const item of menu.items) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        result.push({ name: item.category, id: item.categoryId || encodeURIComponent(item.category) });
      }
    }
    return result;
  }, [menu.items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return menu.items;
    return menu.items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.secondaryName && i.secondaryName.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  }, [menu.items, searchQuery]);

  const groups = useMemo(() => {
    const grouped: Record<string, PublicMenuItem[]> = {};
    for (const item of filteredItems) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return Object.entries(grouped).map(([category, items]) => ({
      category,
      categoryId: items[0].categoryId || encodeURIComponent(category),
      items,
    }));
  }, [filteredItems]);

  const slides = useMemo(() => {
    const list = [{ type: "welcome", id: "welcome" }];
    if (menu.carousel && menu.carousel.length > 0) {
      for (const mediaId of menu.carousel) {
        list.push({ type: "media", id: mediaId });
      }
    }
    return list;
  }, [menu.carousel]);

  // Auto-scroll carousel every 4.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides]);

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    scrollContainerToChild(tabsRef.current, `tab2-${id}`);
    scrollContainerToChild(circleTabsRef.current, `tabCircle-${id}`);
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    const onScroll = () => {
      const pos = window.scrollY + 120;
      let cur = "";
      for (const cat of categories) {
        const el = document.getElementById(cat.id);
        if (el && pos >= el.offsetTop) cur = cat.id;
      }
      if (cur && cur !== activeCategory) {
        setActiveCategory(cur);
        scrollContainerToChild(tabsRef.current, `tab2-${cur}`);
        scrollContainerToChild(circleTabsRef.current, `tabCircle-${cur}`);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0].id);
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories, activeCategory, searchQuery]);

  /* ─── Price chip ──────────────────────────────── */
  const PriceChip = useCallback(({ khr, usd }: { khr: number | null; usd: number | null }) => {
    return (
      <div className="flex flex-col items-start gap-0.5">
        {usd !== null && (
          <span className="font-bold tracking-tight" style={{ color: T.dark, fontSize: "1.05rem" }}>
            ${(usd / 100).toFixed(2)}
          </span>
        )}
        {khr !== null && usd !== null && (
          <span className="text-[11px] font-medium tracking-tight" style={{ color: T.gold }}>
            {new Intl.NumberFormat("km-KH").format(khr)} ៛
          </span>
        )}
        {khr !== null && usd === null && (
          <span className="font-bold" style={{ color: T.dark, fontSize: "1.05rem" }}>
            {new Intl.NumberFormat("km-KH").format(khr)} ៛
          </span>
        )}
      </div>
    );
  }, [T]);

  /* ─── Price block for Detail View ──────────────── */
  const PriceBlock = useCallback(({ khr, usd }: { khr: number | null; usd: number | null }) => {
    return (
      <div className="flex items-center gap-4 py-1">
        {usd !== null && (
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: T.gold }}>
              USD Price
            </span>
            <span className="font-serif text-3xl font-bold" style={{ color: T.dark }}>
              ${(usd / 100).toFixed(2)}
            </span>
          </div>
        )}
        {usd !== null && khr !== null && (
          <div className="h-10 w-px self-center" style={{ background: T.border }} />
        )}
        {khr !== null && (
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: T.muted }}>
              KHR Estimate
            </span>
            <span className="text-xl font-bold" style={{ color: T.green }}>
              {new Intl.NumberFormat("km-KH").format(khr)} <span className="text-sm">៛</span>
            </span>
          </div>
        )}
      </div>
    );
  }, [T]);

  return (
    <>
      <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: "88px", transition: "background-color 0.2s ease" }}>

        {/* ── Top Header ── */}
        <header
          className="sticky top-0 z-40"
          style={{
            background: isDark ? "rgba(18,18,18,0.95)" : "rgba(250,247,242,0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${T.border}`,
            transition: "background-color 0.2s ease, border-color 0.2s ease"
          }}
        >
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p style={{ color: T.gold, fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {locale === "en" ? "Digital Menu" : "ម៉ឺនុយឌីជីថល"}
              </p>
              <h1 className="font-serif truncate mt-0.5" style={{ color: T.dark, fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.15 }}>
                {menu.restaurant}
              </h1>
              <p className="truncate opacity-75 font-sans" style={{ color: T.muted, fontSize: "10px", fontWeight: 500, marginTop: "1px" }}>
                {menu.branchName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/menu/${slug}?lang=${locale === "en" ? "km" : "en"}`}
                className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-bold transition-all hover:opacity-85 shadow-xs"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", color: T.dark, border: `1px solid ${T.border}` }}
              >
                {locale === "en" ? (
                  // Cambodia Flag (to toggle to Khmer)
                  <div className="relative size-4 overflow-hidden rounded-xs shrink-0 border border-stone-200/10">
                    <Image
                      src="/Flag_of_Cambodia.svg"
                      alt="Cambodia Flag"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  // United Kingdom / Union Jack Flag (to toggle to English)
                  <svg className="size-4 rounded-xs shrink-0" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                    <clipPath id="s">
                      <path d="M0,0 L60,0 L60,30 L0,30 Z"/>
                    </clipPath>
                    <g clipPath="url(#s)">
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFF" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#012169" strokeWidth="4"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" strokeDasharray="30 30" strokeDashoffset="30"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" strokeDasharray="0 30 30 0"/>
                      <path d="M30,0 L30,30 M0,15 L60,15" stroke="#FFF" strokeWidth="10"/>
                      <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/>
                    </g>
                  </svg>
                )}
                <span>{locale === "en" ? "ខ្មែរ" : "English"}</span>
              </Link>
              
              {/* Theme toggle switch */}
              <button
                onClick={toggleTheme}
                className="inline-flex size-8 items-center justify-center rounded-full transition-all hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
                style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", color: T.dark, border: `1px solid ${T.border}` }}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-stone-600" />}
              </button>

              {isAdmin && (
                <Link href="/admin/menu-items" className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold" style={{ background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}40` }}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ── Main content area ── */}
        <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-6">

          {/* ── Carousel Slider ── */}
          <div className="relative mb-6 overflow-hidden rounded-2xl h-52 shadow-md" style={{ border: `1px solid ${T.border}` }}>
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {slides.map((slide, idx) => (
                <div key={slide.id} className="w-full h-full shrink-0 relative">
                  {slide.type === "welcome" ? (
                    <div
                      className="w-full h-full flex flex-col justify-center p-6 relative overflow-hidden"
                      style={{
                        background: isDark 
                          ? "linear-gradient(135deg, #0d0c0a 0%, #15130f 50%, #0d0c0a 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f7f6f2 100%)",
                      }}
                    >
                      {/* Subtle pattern background */}
                      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />
                      
                      {/* Elegant thin inner border */}
                      <div className="absolute inset-3.5 rounded-xl pointer-events-none" style={{ border: `1px solid ${isDark ? "rgba(201,169,110,0.15)" : "rgba(201,169,110,0.25)"}` }} />
                      
                      {/* Absolute corner accents for premium look */}
                      <div className="absolute top-4 left-4 w-2 h-2" style={{ borderTop: `1.5px solid ${T.gold}`, borderLeft: `1.5px solid ${T.gold}` }} />
                      <div className="absolute top-4 right-4 w-2 h-2" style={{ borderTop: `1.5px solid ${T.gold}`, borderRight: `1.5px solid ${T.gold}` }} />
                      <div className="absolute bottom-4 left-4 w-2 h-2" style={{ borderBottom: `1.5px solid ${T.gold}`, borderLeft: `1.5px solid ${T.gold}` }} />
                      <div className="absolute bottom-4 right-4 w-2 h-2" style={{ borderBottom: `1.5px solid ${T.gold}`, borderRight: `1.5px solid ${T.gold}` }} />

                      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
                        {/* Elegant gold hexagon-inspired badge with initials */}
                        <div 
                          className="flex size-14 items-center justify-center mb-3 transition-transform duration-700 hover:scale-105"
                          style={{ 
                            background: isDark ? "rgba(201,169,110,0.05)" : "rgba(201,169,110,0.08)", 
                            border: `2px solid ${T.gold}`,
                            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                            boxShadow: "0 0 15px rgba(201,169,110,0.2)"
                          }}
                        >
                          <span className="font-serif text-lg font-bold tracking-widest" style={{ color: T.gold }}>
                            {menu.restaurant.substring(0, 2).toUpperCase()}
                          </span>
                        </div>

                        {/* Welcome/Greeting subtitle */}
                        <p className="text-[10px] font-bold tracking-[0.25em]" style={{ color: T.gold }}>
                          {locale === "en" ? "WELCOME TO" : "ស្វាគមន៍មកកាន់"}
                        </p>
                        
                        {/* Restaurant Name */}
                        <h2 className="font-serif leading-tight mt-1 px-4 truncate max-w-full" style={{ color: T.dark, fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.015em" }}>
                          {menu.restaurant}
                        </h2>

                        {/* Elegant Tagline / Sub-items */}
                        <p className="text-[10px] mt-2 flex items-center justify-center gap-2 opacity-80" style={{ color: T.muted }}>
                          <span>{locale === "en" ? "Quality" : "គុណភាពល្អ"}</span>
                          <span className="text-[6px] opacity-40">•</span>
                          <span>{locale === "en" ? "Fair Price" : "តម្លៃសមរម្យ"}</span>
                          <span className="text-[6px] opacity-40">•</span>
                          <span>{locale === "en" ? "Best Service" : "សេវាកម្មល្អ"}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative bg-black">
                      <Image
                        src={`/api/media/${slide.id}`}
                        alt=""
                        fill
                        className="object-cover"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 z-10 text-white">
                        <h3 className="font-serif text-lg font-bold leading-tight">
                          {menu.restaurant}
                        </h3>
                        <p className="text-xs text-white/70 mt-0.5">
                          {menu.branchName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Indicator Dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className="size-2 rounded-full transition-all duration-200"
                    style={{
                      background: idx === carouselIndex ? T.gold : "rgba(255, 255, 255, 0.4)",
                      width: idx === carouselIndex ? "14px" : "8px",
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Search Bar ── */}
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2" style={{ color: T.muted }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "en" ? "Search dishes, drinks…" : "ស្វែងរកមុខម្ហូប ភេសជ្ជៈ..."}
              className="h-11 w-full rounded-2xl pl-10 pr-4 text-sm transition-all"
              style={{ background: T.card, border: `1.5px solid ${T.border}`, color: T.dark, outline: "none" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = T.gold; (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${T.gold}18`; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = T.border; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }}>
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* ── Circular Categories Scroll Row ── */}
          {!searchQuery && categories.length > 0 && (
            <div ref={circleTabsRef} className="mb-6 overflow-x-auto py-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-4 px-1 justify-start">
                {categories.map((cat) => {
                  const active = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`tabCircle-${cat.id}`}
                      onClick={() => scrollToCategory(cat.id)}
                      className="flex flex-col items-center gap-2 shrink-0 cursor-pointer select-none focus:outline-none"
                    >
                      <div
                        className="flex size-14 items-center justify-center rounded-full transition-all duration-200"
                        style={{
                          background: active ? T.gold : T.card,
                          border: `1.5px solid ${active ? T.gold : T.border}`,
                          boxShadow: active ? `0 4px 14px ${T.gold}30` : T.cardShadow,
                          transform: active ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        <ChefHat className="size-6 transition-colors" style={{ color: active ? "#1C1814" : T.gold }} />
                      </div>
                      <span
                        className="text-[11px] font-semibold transition-colors truncate max-w-[80px] text-center"
                        style={{ color: active ? T.gold : T.dark, fontWeight: active ? 700 : 500 }}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Grid Menu List ── */}
          <div className="space-y-8 mt-4">
            {groups.map((group) => (
              <section key={group.category} id={group.categoryId} className="scroll-mt-[80px]">
                {/* Section Header */}
                <div className="flex items-end gap-2.5 mb-3.5">
                  <h2 className="font-serif leading-none" style={{ color: T.dark, fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {group.category}
                  </h2>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold mb-0.5" style={{ background: `${T.gold}16`, color: T.muted }}>
                    {group.items.length}
                  </span>
                  <div className="flex-1 h-px mb-1.5" style={{ background: `linear-gradient(to right, ${T.border}, transparent)` }} />
                </div>

                {/* Grid Item Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="group cursor-pointer rounded-2xl overflow-hidden flex flex-col transition-all duration-200"
                      style={{
                        background: T.card,
                        border: `1px solid ${T.border}`,
                        boxShadow: T.cardShadow,
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "translateY(-3px) scale(1.01)";
                        el.style.boxShadow = T.cardHoverShadow;
                        el.style.borderColor = `${T.gold}88`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = "";
                        el.style.boxShadow = T.cardShadow;
                        el.style.borderColor = T.border;
                      }}
                    >
                      {/* Card photo image */}
                      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1", background: isDark ? "#242424" : "#F3F4F6" }}>
                        {item.imageId ? (
                          <Image
                            src={`/api/media/${item.imageId}`}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 33vw"
                            className="object-cover transition-transform duration-355 ease-out group-hover:scale-106"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center font-serif font-bold text-2xl"
                            style={{ background: `linear-gradient(135deg, ${T.gold}18, ${T.green}10)`, color: T.gold }}
                          >
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Card details body */}
                      <div className="flex flex-col gap-1.5 p-3 flex-1 justify-between">
                        <div>
                          <h3 className="font-semibold leading-snug line-clamp-2" style={{ color: T.dark, fontSize: "0.85rem" }}>
                            {item.name}
                          </h3>
                          {item.secondaryName && (
                            <p className="text-[11px] truncate mt-0.5" style={{ color: T.muted }}>
                              {item.secondaryName}
                            </p>
                          )}
                        </div>
                        <div className="pt-1.5 border-t" style={{ borderColor: T.border }}>
                          <PriceChip khr={item.priceKhr} usd={item.priceUsd} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {groups.length === 0 && (
              <div className="rounded-3xl p-12 text-center" style={{ background: T.softBg, border: `1.5px dashed ${T.border}` }}>
                <ChefHat className="mx-auto size-9 mb-3" style={{ color: `${T.gold}55` }} />
                <p className="font-semibold text-sm" style={{ color: T.dark }}>
                  {locale === "en" ? "No items found" : "មិនមានមុខម្ហូប"}
                </p>
                <button onClick={() => setSearchQuery("")} className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: T.gold, color: T.dark }}>
                  {locale === "en" ? "Clear" : "សម្អាត"}
                </button>
              </div>
            )}

            {/* Developer/SaaS Sales Credit Footer */}
            <div className="mt-12 mb-24 text-center">
              <a 
                href="/" 
                className="text-[11px] font-semibold tracking-wider transition-all hover:opacity-80 active:opacity-75 uppercase"
                style={{ color: T.gold }}
              >
                Powered by QRMenu
              </a>
            </div>
          </div>
        </div>

        {/* ── Fixed Bottom Category Pill Bar ── */}
        {!searchQuery && categories.length > 0 && (
          <nav
            ref={tabsRef}
            className="fixed bottom-0 inset-x-0 z-40 flex overflow-x-auto items-center gap-2 px-4 py-3 scrollbar-none"
            style={{
              background: isDark ? "rgba(18,18,18,0.96)" : "rgba(250,247,242,0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: `1px solid ${T.border}`,
              scrollbarWidth: "none",
            }}
            aria-label="Menu categories"
          >
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`tab2-${cat.id}`}
                  onClick={() => scrollToCategory(cat.id)}
                  className="shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200"
                  style={
                    active
                      ? { background: T.gold, color: isDark ? "#1C1814" : "#FFFFFF", transform: "scale(1.04)" }
                      : { background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", color: T.dark }
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── Item Detail Overlay ── */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent
          side="bottom"
          className="sm:max-w-lg sm:mx-auto sm:rounded-t-3xl overflow-hidden p-0 outline-hidden"
          style={{ maxHeight: "88vh", background: T.bg, border: "none" }}
        >
          {selectedItem && (
            <div className="flex flex-col h-full" style={{ background: T.bg, transition: "background-color 0.2s ease" }}>
              <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full" style={{ background: "#C9A96E55" }} />
              <div className="overflow-y-auto pb-8">
                {selectedItem.imageId ? (
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3", background: "#1C1814" }}>
                    <Image src={`/api/media/${selectedItem.imageId}`} alt="" fill className="object-cover blur-xl scale-110 opacity-30 select-none pointer-events-none" />
                    <Image src={`/api/media/${selectedItem.imageId}`} alt={selectedItem.name} fill className="object-contain relative z-10" priority />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center font-serif font-bold" style={{ aspectRatio: "4/3", fontSize: "4rem", background: "linear-gradient(135deg, #1C1814, #2C3D20)", color: T.gold }}>
                    {selectedItem.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="px-5 pt-5">
                  <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase" style={{ background: `${T.gold}1A`, color: T.gold, letterSpacing: "0.15em" }}>
                    {selectedItem.category}
                  </span>
                  <h2 className="mt-2 font-serif leading-tight" style={{ color: T.dark, fontSize: "1.55rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                    {selectedItem.name}
                  </h2>
                  {selectedItem.secondaryName && (
                    <p lang={locale === "en" ? "km" : "en"} className="mt-1 text-sm font-semibold" style={{ color: T.gold }}>
                      {selectedItem.secondaryName}
                    </p>
                  )}
                  
                  {/* Prices display block */}
                  <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                    <PriceBlock khr={selectedItem.priceKhr} usd={selectedItem.priceUsd} />
                  </div>

                  {selectedItem.description && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: T.gold, letterSpacing: "0.12em" }}>
                        {locale === "en" ? "Description" : "ការពិពណ៌នា"}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{selectedItem.description}</p>
                    </div>
                  )}
                  <button onClick={() => setSelectedItem(null)} className="mt-7 w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:opacity-90" style={{ background: T.dark, color: isDark ? "#121212" : "#FFFFFF" }}>
                    <ArrowLeft className="size-4" />
                    {locale === "en" ? "Back to Menu" : "ត្រឡប់ទៅបញ្ជីមុខម្ហូបវិញ"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}