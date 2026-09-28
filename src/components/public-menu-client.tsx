"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChefHat, ChevronLeft, ArrowRight, Sun, Moon, LayoutDashboard, UtensilsCrossed } from "lucide-react";
import type { PublicMenuItem, PublicWifi } from "@/lib/menu-types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { WifiButton } from "@/components/wifi-sheet";

interface PublicMenuClientProps {
  menu: {
    restaurant: string;
    branchName: string;
    items: PublicMenuItem[];
    carousel?: string[];
    showCarousel?: boolean;
    wifi?: PublicWifi | null;
    logoId?: string | null;
  };
  locale: "en" | "km-KH";
  slug: string;
  isAdmin?: boolean;
  /** Theme resolved on the server (saved cookie or OS client hint), so the first paint is correct. */
  initialTheme?: "dark" | "light";
  /** False when the server had to guess; the client then checks the OS setting before showing the page. */
  themeKnown?: boolean;
}

/* ─── Color Themes ────────────────────────────── */
const themes = {
  dark: {
    bg: "#121212",
    dark: "#FAF7F2", // Cream text
    card: "#1C1C1E", // Dark gray card background
    gold: "#C9A96E", // Premium gold accent (fills, borders)
    goldText: "#C9A96E", // Gold for text — 7.6:1 on card, 8.6:1 on page
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
    gold: "#C9A96E", // Premium gold accent (fills, borders)
    goldText: "#8A6A2F", // Darker gold for text — 5:1 on white (brand gold is only 2.2:1)
    green: "#1B4332", // Deep emerald green
    muted: "#4B5563",
    border: "#E5E7EB",
    softBg: "#F3F4F6",
    cardShadow: "0 4px 12px rgba(0,0,0,0.03)",
    cardHoverShadow: "0 12px 28px rgba(0,0,0,0.08)",
  }
};

const scrollContainerToChild = (container: HTMLElement | null, childId: string) => {
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

type MenuTheme = (typeof themes)["dark"];
const THEME_COOKIE = "menu-theme";
const saveTheme = (value: "dark" | "light") => {
  // A cookie (not localStorage) so the server can render the right theme on the next visit.
  document.cookie = `${THEME_COOKIE}=${value}; path=/menu; max-age=31536000; SameSite=Lax`;
};

const formatKhr = (khr: number) => new Intl.NumberFormat("km-KH").format(khr);

/* ─── Price chip (cards) ───────────────────────── */
function PriceChip({ khr, usd, T }: { khr: number | null; usd: number | null; T: MenuTheme }) {
  return (
    <div className="flex flex-col items-start gap-0.5 tabular-nums">
      {usd !== null && (
        <span className="text-[1.05rem] font-bold tracking-tight" style={{ color: T.dark }}>
          ${(usd / 100).toFixed(2)}
        </span>
      )}
      {khr !== null && usd !== null && (
        <span className="text-xs font-medium tracking-tight" style={{ color: T.goldText }}>
          {formatKhr(khr)} ៛
        </span>
      )}
      {khr !== null && usd === null && (
        <span className="text-[1.05rem] font-bold" style={{ color: T.dark }}>
          {formatKhr(khr)} ៛
        </span>
      )}
    </div>
  );
}

/* ─── Price grid (detail view) ─────────────────── */
function PriceGrid({ khr, usd, T }: { khr: number | null; usd: number | null; T: MenuTheme }) {
  const cells = [
    usd !== null && { label: "USD", value: `$${(usd / 100).toFixed(2)}`, color: T.goldText },
    khr !== null && { label: "KHR", value: `${formatKhr(khr)} ៛`, color: T.dark },
  ].filter(Boolean) as { label: string; value: string; color: string }[];
  if (cells.length === 0) return null;
  return (
    <div
      className="mx-4 mt-5 grid tabular-nums"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`, borderTop: `1px solid ${T.gold}80`, borderBottom: `1px solid ${T.gold}80` }}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className={`flex min-w-0 flex-col gap-0.5 py-3 ${i === 0 ? "pr-3" : "pl-3"}`}
          style={{ borderLeft: i > 0 ? `1px solid ${T.border}` : undefined }}
        >
          <span className="text-xs font-bold" style={{ color: T.muted, letterSpacing: "0.06em" }}>{cell.label}</span>
          <span className="truncate text-[1.875rem] leading-tight font-bold tracking-tight" style={{ color: cell.color }}>
            {cell.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Sold-out badge ───────────────────────────── */
// Inverted against the theme (charcoal on light, cream on dark) so it stands out on cards and photos.
// Line height stays roomy because Khmer marks sit above and below the baseline.
function SoldOutBadge({ isEn, isDark, className = "" }: { isEn: boolean; isDark: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] leading-5 font-bold tracking-wide whitespace-nowrap uppercase shadow-sm ${className}`}
      style={isDark ? { background: "#FAF7F2", color: "#121212" } : { background: "#1F2937", color: "#FFFFFF" }}
    >
      {isEn ? "Sold out" : "អស់ហើយ"}
    </span>
  );
}

const soldOutLabel = (isEn: boolean) => (isEn ? " (sold out)" : " (អស់ហើយ)");

export default function PublicMenuClient({
  menu,
  locale,
  slug,
  isAdmin = false,
  initialTheme = "dark",
  themeKnown = false,
}: PublicMenuClientProps) {
  const [theme, setTheme] = useState<"dark" | "light">(initialTheme);
  const [themeReady, setThemeReady] = useState(themeKnown);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [staffView, setStaffView] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const tabsRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // The server couldn't tell the theme (first visit, no client hint): use a choice saved by the
  // older localStorage version, else the OS setting, and save it so later visits render correctly.
  useEffect(() => {
    if (themeKnown) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_COOKIE);
    } catch {}
    const resolved =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setTheme(resolved);
    setThemeReady(true);
    saveTheme(resolved);
  }, [themeKnown]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
  };

  // Height of the sticky header + category bar, used to offset section scrolling.
  const getStickyOffset = () => (stickyRef.current?.offsetHeight ?? 64) + 12;

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

  // Previous/next follow the order dishes are shown in (category groups, current search applied).
  const visibleItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const selectedIndex = selectedItem ? visibleItems.findIndex((i) => i.id === selectedItem.id) : -1;
  const prevItem = selectedIndex > 0 ? visibleItems[selectedIndex - 1] : null;
  const nextItem = selectedIndex >= 0 && selectedIndex < visibleItems.length - 1 ? visibleItems[selectedIndex + 1] : null;
  const selectedCategoryIndex = selectedItem ? categories.findIndex((c) => c.name === selectedItem.category) : -1;
  const staffNames = {
    km: (locale === "en" ? selectedItem?.secondaryName : selectedItem?.name) || selectedItem?.name || "",
    en: locale === "en" ? selectedItem?.name : selectedItem?.secondaryName,
  };
  const closeItem = () => {
    setSelectedItem(null);
    setStaffView(false);
  };

  // The header already names the restaurant, so the carousel only shows its own photos
  // and is left out entirely when there are none, letting the menu start near the top.
  const slides = useMemo(() => menu.carousel ?? [], [menu.carousel]);

  const itemCodesMap = useMemo(() => {
    const counters: Record<string, number> = {};
    const codes: Record<string, string> = {};
    for (const item of menu.items) {
      const rawCode = item.categoryCode || item.category.slice(0, 3);
      const catCode = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "") || "CAT";
      counters[catCode] = (counters[catCode] || 0) + 1;
      codes[item.id] = `${catCode}-${counters[catCode]}`;
    }
    return codes;
  }, [menu.items]);

  // Auto-advance the carousel, unless the guest prefers reduced motion or the tab is hidden.
  // Depending on carouselIndex restarts the timer after a manual swipe/tap.
  useEffect(() => {
    if (menu.showCarousel === false || slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setCarouselIndex((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [slides, carouselIndex, menu.showCarousel]);

  const goToSlide = (delta: number) => {
    setCarouselIndex((prev) => (prev + delta + slides.length) % slides.length);
  };

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - getStickyOffset();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    }
    scrollContainerToChild(tabsRef.current, `tab-${id}`);
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    const onScroll = () => {
      const pos = window.scrollY + getStickyOffset() + 24;
      let cur = "";
      for (const cat of categories) {
        const el = document.getElementById(cat.id);
        if (el && pos >= el.getBoundingClientRect().top + window.scrollY) cur = cat.id;
      }
      // A short last section never reaches the top, so select it once the page can't scroll further.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && categories.length > 0) cur = categories[categories.length - 1].id;
      if (cur && cur !== activeCategory) {
        setActiveCategory(cur);
        scrollContainerToChild(tabsRef.current, `tab-${cur}`);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0].id);
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories, activeCategory, searchQuery]);

  const isEn = locale === "en";
  const headerBg = isDark ? "rgba(18,18,18,0.9)" : "rgba(249,250,251,0.9)";
  const controlBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  // Theme values exposed as CSS variables so hover/focus states can live in class names.
  const cssVars = {
    "--m-gold": T.gold,
    "--m-border": T.border,
    "--m-card": T.card,
    "--m-fg": T.dark,
  } as React.CSSProperties;

  return (
    <>
      <div
        className={`min-h-dvh${themeReady ? "" : " menu-theme-pending"}`}
        style={{ ...cssVars, background: T.bg, color: T.dark, transition: "background-color 0.2s ease, opacity 0.15s ease" }}
      >

        {/* ── Sticky header + category bar ── */}
        <div
          ref={stickyRef}
          className="sticky top-0 z-40"
          style={{
            background: headerBg,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${T.border}`,
            transition: "background-color 0.2s ease, border-color 0.2s ease",
          }}
        >
          <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {/* Restaurant Logo */}
              {menu.logoId ? (
                <div
                  className="relative size-10 shrink-0 overflow-hidden rounded-xl border shadow-xs sm:size-12 sm:rounded-2xl"
                  style={{ borderColor: T.border, background: T.card }}
                >
                  <Image
                    src={`/api/media/${menu.logoId}`}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border text-base font-bold shadow-xs sm:size-12 sm:rounded-2xl sm:text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${T.gold}25, ${T.gold}08)`,
                    color: T.goldText,
                    borderColor: `${T.gold}35`,
                  }}
                >
                  {menu.restaurant.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="hidden text-[11px] font-extrabold uppercase tracking-[0.15em] sm:block" style={{ color: T.goldText }}>
                  {isEn ? "Digital Menu" : "ម៉ឺនុយឌីជីថល"}
                </p>
                <h1 className="truncate text-base font-bold leading-tight tracking-tight sm:text-xl" style={{ color: T.dark }}>
                  {menu.restaurant}
                </h1>
                <p className="truncate text-xs" style={{ color: T.muted }}>
                  {menu.branchName}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href={`/menu/${slug}?lang=${isEn ? "km" : "en"}`}
                hrefLang={isEn ? "km" : "en"}
                aria-label={isEn ? "ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)" : "Switch to English"}
                className="inline-flex h-11 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold sm:gap-2 sm:px-3.5 shadow-xs transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-gold)]"
                style={{ background: controlBg, color: T.dark, border: `1px solid ${T.border}` }}
              >
                {isEn ? (
                  // Cambodia Flag (to toggle to Khmer)
                  <span className="relative size-4 shrink-0 overflow-hidden rounded-xs">
                    <Image src="/Flag_of_Cambodia.svg" alt="" fill className="object-cover" />
                  </span>
                ) : (
                  // United Kingdom / Union Jack Flag (to toggle to English)
                  <svg aria-hidden="true" className="size-4 shrink-0 rounded-xs" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
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
                <span lang={isEn ? "km" : "en"}>{isEn ? "ខ្មែរ" : "EN"}</span>
              </Link>

              {menu.wifi && <WifiButton wifi={menu.wifi} slug={slug} isEn={isEn} T={T} controlBg={controlBg} cssVars={cssVars} />}

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-gold)]"
                style={{ background: controlBg, color: T.dark, border: `1px solid ${T.border}` }}
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDark ? <Sun className="size-4 text-amber-400" aria-hidden="true" /> : <Moon className="size-4 text-stone-600" aria-hidden="true" />}
              </button>

              {isAdmin && (
                <Link
                  href="/admin/menu-items"
                  aria-label="Open admin"
                  className="inline-flex size-11 items-center justify-center gap-1.5 rounded-full text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-gold)] sm:w-auto sm:px-3.5"
                  style={{ background: `${T.gold}20`, color: T.goldText, border: `1px solid ${T.gold}40` }}
                >
                  <LayoutDashboard className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </div>
          </header>

          {/* ── Category bar ── */}
          {!searchQuery && categories.length > 1 && (
            <nav
              ref={tabsRef}
              className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pt-0.5 pb-2.5 sm:px-6 lg:px-8"
              style={{ scrollbarWidth: "none" }}
              aria-label={isEn ? "Menu categories" : "ប្រភេទម្ហូប"}
            >
              {categories.map((cat) => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`tab-${cat.id}`}
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => scrollToCategory(cat.id)}
                    className="relative h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-200 before:absolute before:-inset-y-0.5 before:inset-x-0 before:content-[''] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--m-gold)]"
                    style={
                      active
                        ? { background: T.gold, color: "#1C1814" }
                        : { background: controlBg, color: T.dark }
                    }
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* ── Main content area ── */}
        <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">

          {/* ── Photo carousel (only when the restaurant uploaded photos and admins haven't hidden it) ── */}
          {menu.showCarousel !== false && slides.length > 0 && (
          <section
            aria-roledescription="carousel"
            aria-label={menu.restaurant}
            className="relative mb-5 h-44 overflow-hidden rounded-2xl bg-black shadow-md sm:mb-6 sm:h-60 lg:h-72 lg:rounded-3xl"
            style={{ border: `1px solid ${T.border}`, touchAction: "pan-y" }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null || slides.length <= 1) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 40) goToSlide(dx < 0 ? 1 : -1);
            }}
          >
            <div
              className="flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {slides.map((mediaId, idx) => (
                <div
                  key={mediaId}
                  className="relative h-full w-full shrink-0"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} / ${slides.length}`}
                  aria-hidden={idx !== carouselIndex}
                >
                  <Image
                    src={`/api/media/${mediaId}`}
                    alt=""
                    fill
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>

            {/* Indicator Dots — each dot has a 24px hit area around a small visual pill */}
            {slides.length > 1 && (
              <>
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className="flex h-6 items-center justify-center px-1"
                      aria-label={`Go to slide ${idx + 1}`}
                      aria-current={idx === carouselIndex ? "true" : undefined}
                    >
                      <span
                        className="block h-2 rounded-full transition-all duration-200"
                        style={{
                          background: idx === carouselIndex ? T.gold : "rgba(255, 255, 255, 0.6)",
                          width: idx === carouselIndex ? "16px" : "8px",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
          )}

          {/* ── Search Bar ── */}
          <div className="relative mb-6 sm:mb-8 lg:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" style={{ color: T.muted }} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search dishes, drinks…" : "ស្វែងរកមុខម្ហូប ភេសជ្ជៈ..."}
              aria-label={isEn ? "Search the menu" : "ស្វែងរកក្នុងម៉ឺនុយ"}
              className="h-12 w-full appearance-none rounded-2xl border-[1.5px] border-[color:var(--m-border)] pr-11 pl-10 text-base transition-[border-color,box-shadow] outline-none focus:border-[color:var(--m-gold)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--m-gold)_20%,transparent)] sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              style={{ background: T.card, color: T.dark }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={isEn ? "Clear search" : "សម្អាតការស្វែងរក"}
                className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full"
                style={{ color: T.muted }}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* ── Grid Menu List ── */}
          <div className="space-y-10 sm:space-y-12">
            {groups.map((group) => (
              <section key={group.category} id={group.categoryId} aria-labelledby={`heading-${group.categoryId}`}>
                {/* Section Header */}
                <div className="mb-4 flex items-center gap-2.5">
                  <h2 id={`heading-${group.categoryId}`} className="text-[1.35rem] leading-tight font-bold tracking-tight sm:text-2xl" style={{ color: T.dark }}>
                    {group.category}
                  </h2>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${T.gold}16`, color: T.muted }}>
                    {group.items.length}
                  </span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${T.border}, transparent)` }} />
                </div>

                {/* A category without any photos reads better as a compact list than as empty cards. */}
                {!group.items.some((item) => item.imageId) ? (
                  <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="relative flex min-h-16 items-center gap-3 rounded-2xl border border-[color:var(--m-border)] px-4 py-3 shadow-sm transition-[box-shadow,border-color] duration-200 focus-within:border-[color:var(--m-gold)] hover:border-[color:color-mix(in_srgb,var(--m-gold)_55%,transparent)] hover:shadow-md motion-safe:active:scale-[0.99]"
                        style={{ background: T.card }}
                      >
                        <div className={`min-w-0 flex-1 ${item.soldOut ? "opacity-60" : ""}`}>
                          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold" style={{ color: T.dark }}>
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                            >
                              {item.name}
                              {item.soldOut && <span className="sr-only">{soldOutLabel(isEn)}</span>}
                            </button>
                          </h3>
                          <p className="mt-0.5 flex min-w-0 items-center gap-2 text-xs" style={{ color: T.muted }}>
                            <span className="shrink-0 font-mono text-[10px] font-bold" style={{ color: T.goldText }}>
                              {itemCodesMap[item.id]}
                            </span>
                            {item.secondaryName && (
                              <span lang={isEn ? "km" : "en"} className="truncate">
                                {item.secondaryName}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5 [&>div]:items-end">
                          {item.soldOut && <SoldOutBadge isEn={isEn} isDark={isDark} />}
                          <div className={item.soldOut ? "opacity-60" : ""}>
                            <PriceChip khr={item.priceKhr} usd={item.priceUsd} T={T} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                  {group.items.map((item) => (
                    <article
                      key={item.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--m-border)] shadow-sm transition-[transform,box-shadow,border-color] duration-200 focus-within:border-[color:var(--m-gold)] hover:border-[color:color-mix(in_srgb,var(--m-gold)_55%,transparent)] hover:shadow-xl motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98]"
                      style={{ background: T.card }}
                    >
                      {/* Card photo image */}
                      <div className="relative aspect-square w-full overflow-hidden" style={{ background: isDark ? "#242424" : "#F3F4F6" }}>
                        {item.imageId ? (
                          <Image
                            src={`/api/media/${item.imageId}`}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                            className={`object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 ${item.soldOut ? "opacity-60 grayscale" : ""}`}
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className={`absolute inset-0 flex items-center justify-center ${item.soldOut ? "opacity-60 grayscale" : ""}`}
                            style={{
                              background: `radial-gradient(circle at 30% 20%, ${T.gold}22, transparent 60%), linear-gradient(135deg, ${T.gold}10, ${T.green}0D)`,
                            }}
                          >
                            <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`, backgroundSize: "14px 14px" }} />
                            <span className="relative flex size-14 items-center justify-center rounded-full sm:size-16" style={{ border: `1px solid ${T.gold}55`, background: `${T.card}B3` }}>
                              <UtensilsCrossed className="size-6 sm:size-7" style={{ color: T.goldText }} strokeWidth={1.5} />
                            </span>
                          </div>
                        )}
                        <span
                          className="absolute top-2 left-2 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold backdrop-blur-sm"
                          style={{ background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.85)", color: T.goldText }}
                        >
                          {itemCodesMap[item.id]}
                        </span>
                        {item.soldOut && <SoldOutBadge isEn={isEn} isDark={isDark} className="absolute top-2 right-2" />}
                      </div>

                      {/* Card details body */}
                      <div className={`flex flex-1 flex-col justify-between gap-2 p-3 sm:p-3.5 ${item.soldOut ? "opacity-60" : ""}`}>
                        <div>
                          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold" style={{ color: T.dark }}>
                            {/* Stretched button makes the whole card tappable while keeping valid, accessible markup. */}
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:content-['']"
                            >
                              {item.name}
                              {item.soldOut && <span className="sr-only">{soldOutLabel(isEn)}</span>}
                            </button>
                          </h3>
                          {item.secondaryName && (
                            <p lang={isEn ? "km" : "en"} className="mt-0.5 truncate text-xs" style={{ color: T.muted }}>
                              {item.secondaryName}
                            </p>
                          )}
                        </div>
                        <div className="border-t pt-2" style={{ borderColor: T.border }}>
                          <PriceChip khr={item.priceKhr} usd={item.priceUsd} T={T} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                )}
              </section>
            ))}

            {groups.length === 0 && (
              <div className="rounded-3xl p-10 text-center sm:p-12" style={{ background: T.softBg, border: `1.5px dashed ${T.border}` }}>
                <ChefHat className="mx-auto mb-3 size-9" style={{ color: `${T.gold}88` }} aria-hidden="true" />
                <p className="text-sm font-semibold" style={{ color: T.dark }}>
                  {isEn ? "No items found" : "មិនមានមុខម្ហូប"}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 h-10 rounded-full px-5 text-sm font-semibold"
                    style={{ background: T.gold, color: "#1C1814" }}
                  >
                    {isEn ? "Clear search" : "សម្អាត"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Footer credit ── */}
          <footer className="mt-12 flex justify-center pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]" style={{ borderTop: `1px solid ${T.border}` }}>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-[11px] font-bold tracking-widest uppercase opacity-80 transition-opacity hover:opacity-100"
              style={{ color: T.goldText }}
            >
              Powered by QRMenu
            </Link>
          </footer>
        </main>
      </div>

      {/* ── Item Detail (full screen) ── */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && closeItem()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-label={selectedItem?.name}
          className="max-h-dvh gap-0 overflow-hidden rounded-none p-0 outline-hidden sm:mx-auto sm:max-w-lg"
          style={{ ...cssVars, height: "100dvh", background: T.bg, border: "none" }}
        >
          {selectedItem && (
            <div className="relative flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)]" style={{ background: T.bg }}>
              {/* Top bar */}
              <div className="flex shrink-0 items-center justify-between" style={{ borderBottom: `1px solid ${T.gold}4D` }}>
                <button
                  type="button"
                  onClick={closeItem}
                  className="flex min-h-13 items-center gap-1.5 px-4 text-[15px] font-bold transition-colors hover:bg-[var(--hover)]"
                  style={{ color: T.dark, ["--hover" as string]: T.softBg }}
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                  {isEn ? "Menu" : "ម៉ឺនុយ"}
                </button>
                <span className="truncate px-4 text-[13px] font-bold" style={{ color: T.goldText }}>
                  {String(selectedCategoryIndex + 1).padStart(2, "0")}&nbsp;&nbsp;{selectedItem.category}
                </span>
              </div>

              <div key={selectedItem.id} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {selectedItem.imageId ? (
                  <div className="relative aspect-square max-h-[60dvh] w-full overflow-hidden" style={{ background: isDark ? "#1C1814" : "#F3F4F6", borderBottom: `1px solid ${T.gold}4D` }}>
                    <Image
                      src={`/api/media/${selectedItem.imageId}`}
                      alt={selectedItem.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className={`object-cover ${selectedItem.soldOut ? "grayscale" : ""}`}
                      priority
                    />
                  </div>
                ) : (
                  <div aria-hidden="true" className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1C1814, #2C3D20)" }}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />
                    <span className="relative flex size-20 items-center justify-center rounded-full" style={{ border: `1px solid ${T.gold}66` }}>
                      <UtensilsCrossed className="size-9" style={{ color: T.gold }} strokeWidth={1.25} />
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-0.5 px-4 pt-5">
                  <h2 className="text-[1.75rem] leading-snug font-bold tracking-tight text-pretty" style={{ color: T.dark }}>
                    {selectedItem.name}
                  </h2>
                  {selectedItem.secondaryName && (
                    <p lang={isEn ? "km" : "en"} className="text-[15px] leading-relaxed" style={{ color: T.muted }}>
                      {selectedItem.secondaryName}
                    </p>
                  )}
                </div>

                {selectedItem.soldOut && (
                  <p
                    role="status"
                    className="mx-4 mt-5 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold"
                    style={{ background: T.softBg, border: `1px solid ${T.border}`, color: T.dark }}
                  >
                    <SoldOutBadge isEn={isEn} isDark={isDark} />
                    {isEn ? "Not available right now. Please ask our staff." : "មិនមានលក់នៅពេលនេះទេ។ សូមសួរបុគ្គលិករបស់យើង។"}
                  </p>
                )}

                <PriceGrid khr={selectedItem.priceKhr} usd={selectedItem.priceUsd} T={T} />

                <div className="px-4 pt-5 pb-6">
                  <button
                    type="button"
                    onClick={() => setStaffView(true)}
                    className="flex min-h-13 w-full items-center justify-between rounded-xl px-5 text-base font-bold transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: T.gold, color: "#121212" }}
                  >
                    {isEn ? "Show to staff" : "បង្ហាញបុគ្គលិក"}
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Previous / next dish */}
              <div className="grid shrink-0 grid-cols-2 pb-[env(safe-area-inset-bottom)]" style={{ borderTop: `1px solid ${T.gold}4D` }}>
                {[
                  { item: prevItem, label: isEn ? "← Previous" : "← មុន", align: "text-left" },
                  { item: nextItem, label: isEn ? "Next →" : "បន្ទាប់ →", align: "text-right" },
                ].map(({ item, label, align }, i) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!item}
                    onClick={() => item && setSelectedItem(item)}
                    className={`flex min-w-0 flex-col gap-0.5 px-4 pt-2.5 pb-3 transition-colors hover:bg-[var(--hover)] disabled:opacity-35 disabled:hover:bg-transparent ${align}`}
                    style={{ ["--hover" as string]: T.softBg, borderRight: i === 0 ? `1px solid ${T.border}` : undefined }}
                  >
                    <span className="text-xs font-bold" style={{ color: T.goldText }}>{label}</span>
                    <span className="truncate text-sm leading-normal font-bold" style={{ color: T.dark }}>{item?.name ?? "—"}</span>
                  </button>
                ))}
              </div>

              {/* Show-to-staff screen: large names and price a waiter can read at a glance */}
              {staffView && (
                <button
                  type="button"
                  onClick={() => setStaffView(false)}
                  className="absolute inset-0 z-20 flex flex-col justify-between px-5 pt-[calc(2rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] text-left"
                  style={{ background: T.gold, color: "#121212" }}
                >
                  <span className="flex flex-col gap-4">
                    <span lang="km" className="text-lg leading-relaxed font-bold">សូមយកមុខម្ហូបនេះ</span>
                    <span lang="km" className="text-[3.25rem] leading-[1.35] font-extrabold text-pretty">{staffNames.km}</span>
                    <span aria-hidden="true" className="h-0.5" style={{ background: "#121212" }} />
                    {staffNames.en && <span lang="en" className="text-[1.375rem] leading-snug font-bold">{staffNames.en}</span>}
                    <span className="text-[1.375rem] font-bold tabular-nums">
                      {[selectedItem.priceUsd !== null && `$${(selectedItem.priceUsd / 100).toFixed(2)}`, selectedItem.priceKhr !== null && `${formatKhr(selectedItem.priceKhr)} ៛`].filter(Boolean).join("  ·  ")}
                    </span>
                  </span>
                  <span className="text-sm font-bold">{isEn ? "Tap anywhere to close" : "ចុចកន្លែងណាមួយដើម្បីបិទ"}</span>
                </button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
