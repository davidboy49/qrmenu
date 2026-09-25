"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChefHat, ArrowLeft, Sun, Moon, LayoutDashboard, UtensilsCrossed } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu-types";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface PublicMenuClientProps {
  menu: {
    restaurant: string;
    branchName: string;
    items: PublicMenuItem[];
    carousel?: string[];
    logoId?: string | null;
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

/* ─── Price block (detail view) ────────────────── */
function PriceBlock({ khr, usd, T }: { khr: number | null; usd: number | null; T: MenuTheme }) {
  return (
    <div className="flex items-center gap-4 py-1 tabular-nums">
      {usd !== null && (
        <div className="flex flex-col">
          <span className="mb-0.5 text-[11px] font-bold tracking-wider uppercase" style={{ color: T.goldText }}>
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
          <span className="mb-0.5 text-[11px] font-bold tracking-wider uppercase" style={{ color: T.muted }}>
            KHR Estimate
          </span>
          <span className="text-xl font-bold" style={{ color: T.green }}>
            {formatKhr(khr)} <span className="text-sm">៛</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function PublicMenuClient({ menu, locale, slug, isAdmin = false }: PublicMenuClientProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const tabsRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Initialize theme from localStorage, falling back to the guest's OS preference.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("menu-theme");
    } catch {}
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("menu-theme", next);
    } catch {}
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

  const slides = useMemo(() => {
    const list = [{ type: "welcome", id: "welcome" }];
    if (menu.carousel && menu.carousel.length > 0) {
      for (const mediaId of menu.carousel) {
        list.push({ type: "media", id: mediaId });
      }
    }
    return list;
  }, [menu.carousel]);

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
    if (slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        setCarouselIndex((prev) => (prev + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [slides, carouselIndex]);

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
      <div className="min-h-dvh" style={{ ...cssVars, background: T.bg, color: T.dark, transition: "background-color 0.2s ease" }}>

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
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border font-serif text-base font-bold shadow-xs sm:size-12 sm:rounded-2xl sm:text-lg"
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
                <h1 className="truncate font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl" style={{ color: T.dark }}>
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
                className="inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-xs font-bold shadow-xs transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-gold)]"
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

          {/* ── Carousel Slider ── */}
          <section
            aria-roledescription="carousel"
            aria-label={menu.restaurant}
            className="relative mb-5 h-44 overflow-hidden rounded-2xl shadow-md sm:mb-6 sm:h-60 lg:h-72 lg:rounded-3xl"
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
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="relative h-full w-full shrink-0"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} / ${slides.length}`}
                  aria-hidden={idx !== carouselIndex}
                >
                  {slide.type === "welcome" ? (
                    <div
                      className="relative flex h-full w-full flex-col justify-center overflow-hidden p-6"
                      style={{
                        background: isDark
                          ? "linear-gradient(135deg, #0d0c0a 0%, #15130f 50%, #0d0c0a 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f7f6f2 100%)",
                      }}
                    >
                      {/* Subtle pattern background */}
                      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />

                      {/* Elegant thin inner border */}
                      <div className="pointer-events-none absolute inset-3.5 rounded-xl" style={{ border: `1px solid ${isDark ? "rgba(201,169,110,0.15)" : "rgba(201,169,110,0.25)"}` }} />

                      {/* Corner accents */}
                      <div className="absolute top-4 left-4 h-2 w-2" style={{ borderTop: `1.5px solid ${T.gold}`, borderLeft: `1.5px solid ${T.gold}` }} />
                      <div className="absolute top-4 right-4 h-2 w-2" style={{ borderTop: `1.5px solid ${T.gold}`, borderRight: `1.5px solid ${T.gold}` }} />
                      <div className="absolute bottom-4 left-4 h-2 w-2" style={{ borderBottom: `1.5px solid ${T.gold}`, borderLeft: `1.5px solid ${T.gold}` }} />
                      <div className="absolute right-4 bottom-4 h-2 w-2" style={{ borderBottom: `1.5px solid ${T.gold}`, borderRight: `1.5px solid ${T.gold}` }} />

                      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                        {/* Gold hexagon badge with initials */}
                        <div
                          className="mb-3 flex size-12 items-center justify-center sm:size-14 lg:size-16"
                          style={{
                            background: isDark ? "rgba(201,169,110,0.05)" : "rgba(201,169,110,0.08)",
                            border: `2px solid ${T.gold}`,
                            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                          }}
                        >
                          <span className="font-serif text-base font-bold tracking-widest sm:text-lg" style={{ color: T.goldText }}>
                            {menu.restaurant.substring(0, 2).toUpperCase()}
                          </span>
                        </div>

                        <p className="text-[10px] font-bold tracking-[0.25em] sm:text-xs" style={{ color: T.goldText }}>
                          {isEn ? "WELCOME TO" : "ស្វាគមន៍មកកាន់"}
                        </p>

                        <h2 className="mt-1 max-w-full truncate px-4 font-serif text-2xl leading-tight font-bold tracking-tight sm:text-3xl lg:text-4xl" style={{ color: T.dark }}>
                          {menu.restaurant}
                        </h2>

                        <p className="mt-2 flex items-center justify-center gap-2 text-[11px] opacity-80 sm:text-xs" style={{ color: T.muted }}>
                          <span>{isEn ? "Quality" : "គុណភាពល្អ"}</span>
                          <span aria-hidden="true" className="opacity-40">•</span>
                          <span>{isEn ? "Fair Price" : "តម្លៃសមរម្យ"}</span>
                          <span aria-hidden="true" className="opacity-40">•</span>
                          <span>{isEn ? "Best Service" : "សេវាកម្មល្អ"}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full w-full bg-black">
                      <Image
                        src={`/api/media/${slide.id}`}
                        alt=""
                        fill
                        sizes="(max-width: 1152px) 100vw, 1152px"
                        className="object-cover"
                        priority={idx === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 z-10 text-white sm:bottom-6 sm:left-6">
                        <h3 className="font-serif text-lg leading-tight font-bold sm:text-2xl">
                          {menu.restaurant}
                        </h3>
                        <p className="mt-0.5 text-xs text-white/75 sm:text-sm">
                          {menu.branchName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Indicator Dots — each dot has a 24px hit area around a small visual pill */}
            {slides.length > 1 && (
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
                        background: idx === carouselIndex ? T.gold : "rgba(255, 255, 255, 0.45)",
                        width: idx === carouselIndex ? "16px" : "8px",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

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
                  <h2 id={`heading-${group.categoryId}`} className="font-serif text-[1.35rem] leading-tight font-bold tracking-tight sm:text-2xl" style={{ color: T.dark }}>
                    {group.category}
                  </h2>
                  <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${T.gold}16`, color: T.muted }}>
                    {group.items.length}
                  </span>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${T.border}, transparent)` }} />
                </div>

                {/* Grid Item Cards */}
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
                            className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-105"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 flex items-center justify-center"
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
                      </div>

                      {/* Card details body */}
                      <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:p-3.5">
                        <div>
                          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold" style={{ color: T.dark }}>
                            {/* Stretched button makes the whole card tappable while keeping valid, accessible markup. */}
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:content-['']"
                            >
                              {item.name}
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

      {/* ── Item Detail Overlay ── */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          aria-label={selectedItem?.name}
          className="max-h-[90dvh] gap-0 overflow-hidden rounded-t-3xl p-0 outline-hidden sm:mx-auto sm:max-w-lg"
          style={{ ...cssVars, background: T.bg, border: "none" }}
        >
          {selectedItem && (
            <div className="relative flex min-h-0 flex-1 flex-col" style={{ background: T.bg }}>
              <div className="absolute top-2.5 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label={isEn ? "Close" : "បិទ"}
                className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
              <div className="min-h-0 overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                {selectedItem.imageId ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: isDark ? "#1C1814" : "#F3F4F6" }}>
                    <Image
                      src={`/api/media/${selectedItem.imageId}`}
                      alt={selectedItem.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div aria-hidden="true" className="relative flex aspect-[16/9] w-full items-center justify-center" style={{ background: "linear-gradient(135deg, #1C1814, #2C3D20)" }}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(${T.gold} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />
                    <span className="relative flex size-20 items-center justify-center rounded-full" style={{ border: `1px solid ${T.gold}66` }}>
                      <UtensilsCrossed className="size-9" style={{ color: T.gold }} strokeWidth={1.25} />
                    </span>
                  </div>
                )}
                <div className="px-5 pt-5 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase" style={{ background: `${T.gold}1A`, color: T.goldText, letterSpacing: "0.15em" }}>
                      {selectedItem.category}
                    </span>
                    <span className="inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: T.softBg, color: T.goldText }}>
                      {itemCodesMap[selectedItem.id]}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif text-2xl leading-tight font-bold tracking-tight sm:text-[1.75rem]" style={{ color: T.dark }}>
                    {selectedItem.name}
                  </h2>
                  {selectedItem.secondaryName && (
                    <p lang={isEn ? "km" : "en"} className="mt-1 text-sm font-semibold" style={{ color: T.goldText }}>
                      {selectedItem.secondaryName}
                    </p>
                  )}

                  {/* Prices display block */}
                  <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                    <PriceBlock khr={selectedItem.priceKhr} usd={selectedItem.priceUsd} T={T} />
                  </div>

                  {selectedItem.description && (
                    <div className="mt-4">
                      <p className="mb-1.5 text-[11px] font-bold uppercase" style={{ color: T.goldText, letterSpacing: "0.12em" }}>
                        {isEn ? "Description" : "ការពិពណ៌នា"}
                      </p>
                      <p className="text-[15px] leading-relaxed" style={{ color: T.muted }}>{selectedItem.description}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: T.dark, color: isDark ? "#121212" : "#FFFFFF" }}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {isEn ? "Back to Menu" : "ត្រឡប់ទៅបញ្ជីមុខម្ហូបវិញ"}
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
