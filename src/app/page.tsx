import Link from "next/link";
import Image from "next/image";
import {
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	Globe,
	Images,
	Languages,
	Menu,
	QrCode,
	Send,
	Sparkles,
	ToggleRight,
	Utensils,
	Wifi,
	Wallet,
} from "lucide-react";

const TELEGRAM = "https://t.me/S_David7";
const DEMO = "/menu/sabay-kitchen";

const NAV = [
	{ href: "#features", label: "Features" },
	{ href: "#demo", label: "Live demo" },
	{ href: "#how-it-works", label: "How it works" },
	{ href: "#contact", label: "Contact" },
];

const FEATURES = [
	{
		icon: Languages,
		title: "Khmer & English, one tap",
		description: "Guests switch language instantly. Layout, fonts and prices hold steady in both.",
	},
	{
		icon: Wallet,
		title: "USD and Riel together",
		description: "Every dish shows both currencies, formatted cleanly, so nobody has to do the maths.",
	},
	{
		icon: ToggleRight,
		title: "Update from your phone",
		description: "Change a price, add a seasonal dish or mark something sold out mid-service. It's live in seconds.",
	},
	{
		icon: Wifi,
		title: "Guest Wi-Fi built in",
		description: "Each branch can show its network, a copy-able password and a join-by-scan QR code.",
	},
	{
		icon: Images,
		title: "Photos that sell",
		description: "A hero carousel and full dish pages with large photography, set in editorial type.",
	},
	{
		icon: Utensils,
		title: "Every branch, its own menu",
		description: "Separate prices, availability and Wi-Fi per location, all managed from one admin.",
	},
];

const STEPS = [
	{ num: "01", title: "Send us your menu", desc: "A PDF, Word file or photos. Share it with us on Telegram." },
	{ num: "02", title: "We build it", desc: "We set up your branded menu with Khmer and English translations." },
	{ num: "03", title: "Scan and serve", desc: "We hand over printed-ready QR codes for your tables. You're live the same day." },
];

const GALLERY_DISHES = [
	{ tag: "AMOK", name: "Fish Amok", usd: "$7.00", khr: "28,000 ៛" },
	{ tag: "LOK", name: "Beef Lok Lak", usd: "$6.50", khr: "26,000 ៛" },
	{ tag: "COFF", name: "Iced Khmer Coffee", usd: "$2.00", khr: "8,000 ៛", soldOut: false },
];

function SectionHead({ eyebrow, title, children, center = true }: { eyebrow: string; title: string; children?: React.ReactNode; center?: boolean }) {
	return (
		<div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
			<p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a7b4f]">{eyebrow}</p>
			<h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#10231a] sm:text-5xl">{title}</h2>
			{children && <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">{children}</p>}
		</div>
	);
}

function PhoneMock() {
	return (
		<div className="relative mx-auto w-full max-w-[300px]">
			<div className="absolute -inset-8 -z-10 rounded-full bg-[#c5a880]/25 blur-3xl" aria-hidden="true" />
			<div className="aspect-[9/18.5] rounded-[2.6rem] border-[6px] border-stone-900 bg-stone-900 p-2 shadow-2xl shadow-stone-900/30">
				<div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#f7f3ec] text-left">
					<div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-stone-900" aria-hidden="true" />

					<div className="flex items-end justify-between px-4 pb-2 pt-9">
						<div>
							<p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#9a7b4f]">Digital menu</p>
							<p className="font-serif text-lg font-semibold leading-none text-[#10231a]">Sabay Kitchen</p>
						</div>
						<div className="flex gap-1.5">
							<span className="flex size-7 items-center justify-center rounded-full bg-[#10231a] text-[#c5a880] shadow-sm" aria-hidden="true">
								<Wifi className="size-3.5" />
							</span>
							<span className="flex h-7 items-center gap-1 rounded-full border border-stone-200 bg-white px-2 text-[9px] font-bold text-stone-600">
								<Globe className="size-3 text-stone-400" aria-hidden="true" />
								ខ្មែរ
							</span>
						</div>
					</div>

					<div className="mx-3 rounded-2xl bg-gradient-to-br from-[#10231a] to-[#1f4230] p-3.5 text-white">
						<p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#c5a880]">Welcome to our table</p>
						<p className="mt-1 font-serif text-base leading-tight">Fresh Khmer flavours, served today.</p>
					</div>

					<div className="flex gap-1.5 overflow-hidden px-3 py-3">
						<span className="shrink-0 rounded-full bg-[#10231a] px-2.5 py-1 text-[9px] font-bold text-[#c5a880]">Favourites</span>
						<span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-stone-600">Noodles &amp; rice</span>
						<span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-stone-600">Drinks</span>
					</div>

					<ul className="flex-1 space-y-2 px-3">
						{GALLERY_DISHES.map((d) => (
							<li key={d.name} className="flex gap-2.5 rounded-xl border border-stone-200/70 bg-white p-2">
								<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#efe7d8] text-[9px] font-bold tracking-wide text-[#10231a]">{d.tag}</div>
								<div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
									<p className="truncate text-[11px] font-bold text-stone-900">{d.name}</p>
									<div className="flex items-end justify-between">
										<span className="text-[9px] text-stone-400">{d.usd}</span>
										<span className="text-[11px] font-bold text-[#10231a]">{d.khr}</span>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

export default function LandingPage() {
	return (
		<div className="min-h-screen bg-[#f7f3ec] font-sans text-stone-900 antialiased selection:bg-[#c5a880]/40">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-stone-900/10 bg-[#f7f3ec]/85 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-20 lg:px-8">
					<Link href="/" className="flex items-center gap-2.5">
						<span className="flex size-9 items-center justify-center rounded-lg bg-[#10231a] text-[#c5a880]">
							<Utensils className="size-[18px]" aria-hidden="true" />
						</span>
						<span className="font-serif text-xl font-semibold uppercase tracking-[0.18em] text-[#10231a]">QR Menu</span>
					</Link>

					<nav className="hidden items-center gap-8 text-sm font-semibold text-stone-600 md:flex" aria-label="Primary">
						{NAV.map((n) => (
							<a key={n.href} href={n.href} className="transition-colors hover:text-[#10231a]">
								{n.label}
							</a>
						))}
					</nav>

					<div className="hidden items-center gap-3 md:flex">
						<Link href="/admin" className="rounded-full px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-900/5">
							Admin
						</Link>
						<a
							href={TELEGRAM}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-full bg-[#10231a] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#1c3a2a]"
						>
							<Send className="size-3.5" aria-hidden="true" />
							Get started
						</a>
					</div>

					{/* Mobile menu: native <details>, no client JS needed */}
					<details className="group relative md:hidden">
						<summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full text-stone-800 hover:bg-stone-900/5 [&::-webkit-details-marker]:hidden" aria-label="Menu">
							<Menu className="size-6" aria-hidden="true" />
						</summary>
						<div className="absolute right-0 top-14 w-64 rounded-2xl border border-stone-900/10 bg-white p-3 shadow-xl">
							{NAV.map((n) => (
								<a key={n.href} href={n.href} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100">
									{n.label}
								</a>
							))}
							<div className="my-2 h-px bg-stone-200" />
							<Link href="/admin" className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-100">
								Admin
							</Link>
							<a
								href={TELEGRAM}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10231a] text-xs font-bold uppercase tracking-wider text-white"
							>
								<Send className="size-3.5" aria-hidden="true" />
								Get started
							</a>
						</div>
					</details>
				</div>
			</header>

			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:pb-28">
					<div>
						<p className="inline-flex items-center gap-2 rounded-full border border-[#9a7b4f]/30 bg-[#c5a880]/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a5f37]">
							<Sparkles className="size-3" aria-hidden="true" />
							Digital menus for Cambodian restaurants
						</p>
						<h1 className="mt-6 font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-[#10231a] sm:text-7xl">
							Your menu, as <span className="italic text-[#9a7b4f]">beautiful</span> as your food.
						</h1>
						<p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
							A fast, elegant QR menu in Khmer and English with USD and Riel pricing. Change a price or mark a dish sold out from your phone, and guests see it instantly.
						</p>
						<div className="mt-9 flex flex-col gap-3 sm:flex-row">
							<Link
								href={DEMO}
								className="inline-flex items-center justify-center gap-2 rounded-full bg-[#10231a] px-7 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-[#10231a]/20 transition-colors hover:bg-[#1c3a2a]"
							>
								Try the live demo
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
							<a
								href="#contact"
								className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-900/20 px-7 py-4 text-sm font-bold uppercase tracking-widest text-[#10231a] transition-colors hover:bg-stone-900/5"
							>
								<QrCode className="size-4" aria-hidden="true" />
								Get your QR code
							</a>
						</div>
						<ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-stone-600">
							{["No app for guests to install", "Live in a day", "Support in Khmer & English"].map((t) => (
								<li key={t} className="flex items-center gap-2">
									<Check className="size-4 text-[#9a7b4f]" aria-hidden="true" />
									{t}
								</li>
							))}
						</ul>
					</div>

					<PhoneMock />
				</div>
				<a href="#features" aria-label="Scroll to features" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-stone-400 lg:block">
					<ChevronDown className="size-5" />
				</a>
			</section>

			{/* Features */}
			<section id="features" className="scroll-mt-20 bg-white py-24 sm:py-28">
				<div className="mx-auto max-w-6xl px-5 lg:px-8">
					<SectionHead eyebrow="What you get" title="Everything a modern menu needs">
						Most QR menus are a PDF in a browser. This one is built for phones, for Khmer script, and for the pace of a busy service.
					</SectionHead>
					<div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-stone-200 bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f) => (
							<div key={f.title} className="bg-white p-8 transition-colors hover:bg-[#faf7f1]">
								<span className="flex size-11 items-center justify-center rounded-xl bg-[#10231a] text-[#c5a880]">
									<f.icon className="size-5" aria-hidden="true" />
								</span>
								<h3 className="mt-5 text-lg font-bold text-[#10231a]">{f.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-stone-600">{f.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Demo */}
			<section id="demo" className="scroll-mt-20 py-24 sm:py-28">
				<div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
					<div className="relative overflow-hidden rounded-3xl bg-[#10231a] p-10 sm:p-14">
						<div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#c5a880]/15 blur-3xl" aria-hidden="true" />
						<p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c5a880]">Sabay Kitchen</p>
						<p className="relative mt-4 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">See it the way your guests will.</p>
						<p className="relative mt-4 max-w-md text-stone-300">Open the demo on your phone and try the language switch, the dish pages and the Wi-Fi button.</p>
						<Link
							href={DEMO}
							className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#c5a880] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-stone-950 transition-colors hover:bg-[#d6bb94]"
						>
							Open demo menu
							<ArrowUpRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
					<div>
						<SectionHead center={false} eyebrow="Try it" title="No sign-up. Just scan or tap.">
							The demo is a real, working menu with the same ordering of categories, the same dish pages and the same admin tools you would get.
						</SectionHead>
						<ul className="mt-8 space-y-4">
							{["Sharp photography that fills the screen", "Khmer and English switch without reloading your place", "Prices in USD and KHR on every dish", "Wi-Fi sheet with copy buttons and a QR code"].map((t) => (
								<li key={t} className="flex items-start gap-3 text-stone-700">
									<Check className="mt-0.5 size-5 shrink-0 text-[#9a7b4f]" aria-hidden="true" />
									<span className="font-medium">{t}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section id="how-it-works" className="scroll-mt-20 bg-white py-24 sm:py-28">
				<div className="mx-auto max-w-6xl px-5 lg:px-8">
					<SectionHead eyebrow="Simple onboarding" title="Live in three steps" />
					<ol className="mt-16 grid gap-10 md:grid-cols-3">
						{STEPS.map((s) => (
							<li key={s.num} className="relative border-t-2 border-[#10231a] pt-6">
								<span className="font-serif text-5xl font-semibold text-[#c5a880]">{s.num}</span>
								<h3 className="mt-3 text-lg font-bold text-[#10231a]">{s.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-stone-600">{s.desc}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* Contact */}
			<section id="contact" className="scroll-mt-20 px-5 py-24 sm:py-28 lg:px-8">
				<div className="relative mx-auto grid max-w-6xl items-center gap-12 overflow-hidden rounded-[2rem] bg-[#10231a] p-8 text-white sm:p-14 md:grid-cols-[1.2fr_0.8fr]">
					<div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-[#c5a880]/10 blur-3xl" aria-hidden="true" />
					<div className="relative">
						<p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c5a880]">Get started today</p>
						<h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] sm:text-5xl">Ready to put your menu on every table?</h2>
						<p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-300">Message us on Telegram with your current menu and we&apos;ll take it from there.</p>
						<a
							href={TELEGRAM}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#c5a880] px-8 py-4 text-sm font-bold uppercase tracking-wider text-stone-950 transition-colors hover:bg-[#d6bb94]"
						>
							<Send className="size-4" aria-hidden="true" />
							Chat on Telegram
						</a>
					</div>
					<div className="relative mx-auto w-full max-w-[260px] rounded-3xl bg-white p-5 text-center text-stone-900 shadow-2xl">
						<div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
							<Image src="/telegram-contact-qr.png" alt="Scan to message QR Menu support on Telegram" fill className="object-contain p-2" />
						</div>
						<p className="mt-4 text-xs font-bold uppercase tracking-wider">Scan to message</p>
						<p className="mt-0.5 text-[11px] text-stone-500">Telegram: @S_David7</p>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-stone-900/10 py-10">
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 text-sm text-stone-500 sm:flex-row lg:px-8">
					<div className="flex items-center gap-2.5">
						<span className="flex size-7 items-center justify-center rounded-md bg-[#10231a] text-[#c5a880]">
							<Utensils className="size-3.5" aria-hidden="true" />
						</span>
						<span className="font-serif text-base font-semibold uppercase tracking-[0.18em] text-[#10231a]">QR Menu</span>
					</div>
					<nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium" aria-label="Footer">
						{NAV.map((n) => (
							<a key={n.href} href={n.href} className="transition-colors hover:text-[#10231a]">
								{n.label}
							</a>
						))}
					</nav>
					<p>© {new Date().getFullYear()} QR Menu</p>
				</div>
			</footer>
		</div>
	);
}
