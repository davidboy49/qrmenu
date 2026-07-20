"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Search, X, ChefHat, MapPin, ArrowLeft, Star } from "lucide-react";
import type { PublicMenuItem } from "@/lib/menu-types";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface PublicMenuClientProps {
  menu: {
    restaurant: string;
    branchName: string;
    items: PublicMenuItem[];
  };
  locale: "en" | "km-KH";
  slug: string;
  isAdmin?: boolean;
}

/* ─── Premium Modern Light Tokens ──────────────── */
const T = {
  cream:   "#F9FAFB", // Clean off-white background
  dark:    "#111827", // Dark gray / charcoal
  card:    "#FFFFFF", // Pure white card
  gold:    "#C9A96E", // Premium gold accent
  green:   "#1B4332", // Deep emerald/olive green
  muted:   "#4B5563", // Gray-600 for descriptions
  border:  "#E5E7EB", // Gray-200 border
  softBg:  "#F3F4F6", // Gray-100 soft background
  cardShadow: "0 4px 12px rgba(0,0,0,0.03)",
  cardHoverShadow: "0 12px 28px rgba(0,0,0,0.08)",
};

/* ─── Price chip ──────────────────────────────── */
function PriceChip({ khr, usd }: { khr: number | null; usd: number | null }) {
  return (
    <div>
      {khr !== null && (
        <p style={{ color: T.green, fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.2 }}>
          {new Intl.NumberFormat("km-KH").format(khr)} <span style={{ fontSize: "0.75rem" }}>៛</span>
        </p>
      )}
      {usd !== null && (
        <p style={{ color: T.muted, fontWeight: 500, fontSize: "0.72rem", marginTop: 2 }}>
          ${(usd / 100).toFixed(2)}
        </p>
      )}
    </div>
  );
}

/* ─── Price block for Detail View ──────────────── */
function PriceBlock({ khr, usd }: { khr: number | null; usd: number | null }) {
  return (
    <div className="flex items-baseline gap-3">
      {khr !== null && (
        <span className="font-serif text-2xl font-bold" style={{ color: T.green }}>
          {new Intl.NumberFormat("km-KH").format(khr)} <span className="text-base">៛</span>
        </span>
      )}
      {usd !== null && (
        <span className="text-sm font-semibold" style={{ color: T.muted }}>
          ${(usd / 100).toFixed(2)}
        </span>
      )}
    </div>
  );
}

export default function PublicMenuClient({ menu, locale, slug, isAdmin = false }: PublicMenuClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PublicMenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

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

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    const tab = document.getElementById(`tab2-${id}`);
    tab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    const onScroll = () => {
      const pos = window.scrollY + 100;
      let cur = "";
      for (const cat of categories) {
        const el = document.getElementById(cat.id);
        if (el && pos >= el.offsetTop) cur = cat.id;
      }
      if (cur && cur !== activeCategory) {
        setActiveCategory(cur);
        document.getElementById(`tab2-${cur}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0].id);
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories, activeCategory, searchQuery]);

  return (
    <>
      <div style={{ minHeight: "100vh", background: T.cream, paddingBottom: "88px" }}>

        {/* ── Top Header ── */}
        <header
          className="sticky top-0 z-40"
          style={{
            background: "rgba(28,24,20,0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="mx-auto max-w-2xl flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p style={{ color: T.gold, fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {locale === "en" ? "QR Menu" : "ម៉ឺនុយឌីជីថល"}
              </p>
              <h1 className="font-serif truncate" style={{ color: T.cream, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {menu.restaurant}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/menu/${slug}?lang=${locale === "en" ? "km" : "en"}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all hover:opacity-85"
                style={{ background: "rgba(255,255,255,0.08)", color: T.cream, border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <Globe className="size-3.5 opacity-60" />
                {locale === "en" ? "ខ្មែរ" : "English"}
              </Link>
              {isAdmin && (
                <Link href="/admin/menu-items" className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold" style={{ background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}40` }}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ── Compact Hero ── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #1C1814 0%, #243320 60%, #1A2A1A 100%)", paddingTop: "28px", paddingBottom: "28px" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(${T.gold}09 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${T.gold}18 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />
          <div className="relative mx-auto max-w-2xl px-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${T.gold}14`, border: `1px solid ${T.gold}28` }}>
                <ChefHat className="size-4.5" style={{ color: T.gold }} />
              </div>
              <div>
                <h2 className="font-serif" style={{ color: T.cream, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  {menu.restaurant}
                </h2>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: `${T.cream}90` }}>
                  <MapPin className="size-3" style={{ color: T.gold }} />
                  <span style={{ color: T.gold, fontWeight: 600 }}>{menu.branchName}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ opacity: 0.6 }}>{locale === "en" ? "Menu" : "ម៉ឺនុយ"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="mx-auto max-w-2xl px-4 pt-4 pb-2 sm:px-6">
          <div className="relative">
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
        </div>

        {/* ── Content ── */}
        <div className="mx-auto max-w-2xl px-4 pt-3 pb-4 sm:px-6 space-y-8">
          {groups.map((group) => (
            <section key={group.category} id={group.categoryId} className="scroll-mt-[80px]">
              {/* Category header */}
              <div className="flex items-end gap-2.5 mb-3">
                <h2 className="font-serif leading-none" style={{ color: T.dark, fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
                  {group.category}
                </h2>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold mb-0.5" style={{ background: `${T.gold}16`, color: T.muted }}>
                  {group.items.length}
                </span>
                <div className="flex-1 h-px mb-1.5" style={{ background: `linear-gradient(to right, ${T.border}, transparent)` }} />
              </div>

              {/* 2-column card grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                    {/* Square image */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1/1", background: "#F3F4F6" }}>
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
                      <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.6), transparent)" }} />
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col gap-1 p-2.5 flex-1">
                      <h3 className="font-semibold leading-snug line-clamp-2" style={{ color: T.dark, fontSize: "0.82rem" }}>
                        {item.name}
                      </h3>
                      {item.secondaryName && (
                        <p className="text-[11px] truncate" style={{ color: T.muted }}>{item.secondaryName}</p>
                      )}
                      <div className="mt-auto pt-1.5">
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
        </div>

        {/* ── Fixed Bottom Category Bar ── */}
        {!searchQuery && categories.length > 0 && (
          <nav
            ref={tabsRef}
            className="fixed bottom-0 inset-x-0 z-40 flex overflow-x-auto items-center gap-2 px-4 py-3"
            style={{
              background: "rgba(28,24,20,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.07)",
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
                      ? { background: T.gold, color: T.dark, transform: "scale(1.04)" }
                      : { background: "rgba(255,255,255,0.06)", color: `${T.cream}70` }
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* ── Item Detail Sheet ── */}
      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent
          side="bottom"
          className="sm:max-w-lg sm:mx-auto sm:rounded-t-3xl overflow-hidden p-0 outline-hidden"
          style={{ maxHeight: "88vh", background: T.cream, border: "none" }}
        >
          {selectedItem && (
            <div className="flex flex-col h-full">
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
                  <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase" style={{ background: "#C9A96E1A", color: "#8B7355", letterSpacing: "0.15em" }}>
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
                  <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                    <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "#A89070", letterSpacing: "0.12em" }}>
                      {locale === "en" ? "Price" : "តម្លៃ"}
                    </p>
                    <PriceBlock khr={selectedItem.priceKhr} usd={selectedItem.priceUsd} />
                  </div>
                  {selectedItem.description && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: "#A89070", letterSpacing: "0.12em" }}>
                        {locale === "en" ? "Description" : "ការពិពណ៌នា"}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{selectedItem.description}</p>
                    </div>
                  )}
                  <button onClick={() => setSelectedItem(null)} className="mt-7 w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all hover:opacity-90" style={{ background: "#1C1814", color: T.cream }}>
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