"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { PublicWifi } from "@/lib/menu-types";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

type Colors = { bg: string; dark: string; gold: string; goldText: string; muted: string; border: string };

const ATTRACT_MS = 10_000;

// Escapes the characters the WIFI: QR payload treats as syntax.
const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");

function wifiPayload(wifi: PublicWifi) {
  const password = wifi.security === "nopass" || !wifi.password ? "" : `P:${escapeWifi(wifi.password)};`;
  return `WIFI:T:${wifi.security};S:${escapeWifi(wifi.ssid)};${password};`;
}

/** Signal icon; when `animate` is on, arcs light up from the dot outwards. */
function WifiSignal({ animate, color }: { animate: boolean; color: string }) {
  const arc = (delay: number) => (animate ? { className: "wifi-arc", style: { animationDelay: `${delay}ms` } } : {});
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <path d="M2 8.8a15 15 0 0 1 20 0" {...arc(400)} />
      <path d="M5 12.6a10 10 0 0 1 14 0" {...arc(200)} />
      <path d="M8.5 16.4a5 5 0 0 1 7 0" {...arc(0)} />
      <circle cx="12" cy="20" r="1.2" fill={color} stroke="none" />
    </svg>
  );
}

function CopyRow({ label, value, copyLabel, copiedLabel, mono, T }: { label: string; value: string; copyLabel: string; copiedLabel: string; mono?: boolean; T: Colors }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the value stays on screen to copy by hand.
    }
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold" style={{ color: T.muted, letterSpacing: "0.06em" }}>{label}</p>
        <p className={`text-lg font-bold break-all select-all ${mono ? "font-mono" : ""}`} style={{ color: T.dark }}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-opacity hover:opacity-85"
        style={{ background: `${T.gold}26`, color: T.goldText }}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
      </button>
    </div>
  );
}

export function WifiButton({
  wifi,
  slug,
  isEn,
  T,
  controlBg,
  cssVars,
}: {
  wifi: PublicWifi;
  slug: string;
  isEn: boolean;
  T: Colors;
  controlBg: string;
  cssVars: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [attract, setAttract] = useState(false);
  const [qrSvg, setQrSvg] = useState("");
  const seenKey = `qrmenu:wifi-seen:${slug}`;

  // Blink for a few seconds to invite a tap, unless this guest has already opened it.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(seenKey) === "1";
    } catch {}
    if (seen) return;
    setAttract(true);
    const t = setTimeout(() => setAttract(false), ATTRACT_MS);
    return () => clearTimeout(t);
  }, [seenKey]);

  // The QR library loads only when a guest opens the sheet.
  useEffect(() => {
    if (!open || qrSvg) return;
    let cancelled = false;
    import("qrcode")
      .then((QRCode) => QRCode.toString(wifiPayload(wifi), { type: "svg", margin: 1, errorCorrectionLevel: "M" }))
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, qrSvg, wifi]);

  const openSheet = () => {
    setOpen(true);
    setAttract(false);
    try {
      localStorage.setItem(seenKey, "1");
    } catch {}
  };

  const title = isEn ? "Free Wi-Fi" : "វ៉ាយហ្វាយឥតគិតថ្លៃ";
  const copyLabel = isEn ? "Copy" : "ចម្លង";
  const copiedLabel = isEn ? "Copied" : "បានចម្លង";

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-label={title}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--m-gold)]"
        style={{ background: controlBg, border: `1px solid ${attract ? `${T.gold}80` : T.border}` }}
      >
        <WifiSignal animate={attract} color={T.gold} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-3xl p-0 sm:mx-auto sm:max-w-lg"
          style={{ ...cssVars, background: T.bg, color: T.dark, border: "none" }}
        >
          <div className="px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: T.dark }}>
              <WifiSignal animate={false} color={T.gold} />
              {title}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm leading-relaxed" style={{ color: T.muted }}>
              {wifi.password
                ? isEn
                  ? "Copy the password, then pick this network in your phone's Wi-Fi settings."
                  : "ចម្លងពាក្យសម្ងាត់ រួចជ្រើសរើសបណ្តាញនេះក្នុងការកំណត់ Wi-Fi នៃទូរស័ព្ទរបស់អ្នក។"
                : isEn
                  ? "Pick this network in your phone's Wi-Fi settings. No password needed."
                  : "ជ្រើសរើសបណ្តាញនេះក្នុងការកំណត់ Wi-Fi នៃទូរស័ព្ទរបស់អ្នក។ មិនត្រូវការពាក្យសម្ងាត់ទេ។"}
            </SheetDescription>

            <div className="mt-4" style={{ borderTop: `1px solid ${T.gold}4D`, borderBottom: `1px solid ${T.gold}4D` }}>
              <CopyRow T={T} label={isEn ? "NETWORK" : "បណ្តាញ"} value={wifi.ssid} copyLabel={copyLabel} copiedLabel={copiedLabel} />
              {wifi.password && (
                <div style={{ borderTop: `1px solid ${T.border}` }}>
                  <CopyRow T={T} mono label={isEn ? "PASSWORD" : "ពាក្យសម្ងាត់"} value={wifi.password} copyLabel={copyLabel} copiedLabel={copiedLabel} />
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div
                role="img"
                aria-label={isEn ? "Wi-Fi QR code" : "កូដ QR សម្រាប់ Wi-Fi"}
                className="size-28 shrink-0 overflow-hidden rounded-xl bg-white p-1.5 [&>svg]:size-full"
                dangerouslySetInnerHTML={qrSvg ? { __html: qrSvg } : undefined}
              />
              <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
                {isEn
                  ? "Friends at the table can scan this with their phone camera to join."
                  : "មិត្តភក្តិនៅតុអាចស្កេនកូដនេះដោយកាមេរ៉ាទូរស័ព្ទ ដើម្បីភ្ជាប់។"}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
