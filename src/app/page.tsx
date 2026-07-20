"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
	Sparkles, 
	Globe, 
	Utensils, 
	CheckCircle2, 
	Languages, 
	TrendingUp, 
	Zap, 
	QrCode, 
	MessageSquare, 
	Send, 
	ChevronRight, 
	Menu, 
	X 
} from "lucide-react";

export default function LandingPage() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const features = [
		{
			icon: <Sparkles className="size-5 text-[#c5a880]" />,
			title: "Sensory Elegance",
			description: "Menus designed to match fine dining standards. High-resolution imagery, elegant editorial serif typography, and fluid transitions that elevate your brand."
		},
		{
			icon: <Languages className="size-5 text-[#c5a880]" />,
			title: "Dual Language (EN/KH)",
			description: "Seamless instant toggle between English and Khmer. Built-in translations that preserve layout integrity, making it accessible to both local and international guests."
		},
		{
			icon: <TrendingUp className="size-5 text-[#c5a880]" />,
			title: "Dual Currency Support",
			description: "Show prices in both USD and Khmer Riel (KHR) concurrently. Tap-to-zoom detail panels automatically calculate and format currencies cleanly."
		},
		{
			icon: <Zap className="size-5 text-[#c5a880]" />,
			title: "Real-time Control Panel",
			description: "Update prices, add seasonal dishes, or instantly toggle 'Sold Out' status for any item right from your mobile phone in the middle of a busy service."
		}
	];

	const steps = [
		{
			num: "01",
			title: "Send Us Your Menu",
			desc: "Share your current menu in PDF, Word, or image format via Telegram."
		},
		{
			num: "02",
			title: "We Build Your Digital Menu",
			desc: "Our design experts set up your beautiful mobile menu with local translations."
		},
		{
			num: "03",
			title: "Scan & Serve",
			desc: "We deliver custom-branded QR codes for your tables. Start serving immediately."
		}
	];

	return (
		<div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-[#c5a880]/30 selection:text-stone-900 antialiased font-sans">
			
			{/* Luxury Header */}
			<header className="sticky top-0 z-50 border-b border-stone-200/60 bg-stone-50/90 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="flex h-20 items-center justify-between">
						{/* Logo / Brand */}
						<div className="flex items-center gap-2">
							<div className="flex size-9 items-center justify-center rounded-lg bg-[#0f1f15] text-[#c5a880] shadow-sm">
								<Utensils className="size-5" />
							</div>
							<Link href="/" className="font-serif text-xl font-bold tracking-[0.2em] text-[#0f1f15] uppercase ml-1.5">
								QR Menu
							</Link>
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-stone-600">
							<a href="#features" className="hover:text-[#0f1f15] transition-colors">Features</a>
							<a href="#demo" className="hover:text-[#0f1f15] transition-colors">Live Demo</a>
							<a href="#how-it-works" className="hover:text-[#0f1f15] transition-colors">How it Works</a>
							<a href="#contact" className="hover:text-[#0f1f15] transition-colors">Contact</a>
						</nav>

						{/* Actions */}
						<div className="hidden md:flex items-center gap-4">
							<Link 
								href="/menu/sabay-kitchen"
								className="text-sm font-bold text-stone-700 hover:text-stone-900 transition-colors"
							>
								Demo Menu
							</Link>
							<Link 
								href="/admin"
								className="text-sm font-bold text-stone-700 hover:text-stone-900 transition-colors px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-all"
							>
								Admin Panel
							</Link>
							<a 
								href="https://t.me/S_David7" 
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-full bg-[#0f1f15] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#1a3324] active:scale-95 transition-all"
							>
								<Send className="size-3.5" />
								<span>Get Started</span>
							</a>
						</div>

						{/* Mobile Menu Toggle */}
						<button 
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
						</button>
					</div>
				</div>

				{/* Mobile Dropdown Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t border-stone-200/80 bg-stone-50 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top duration-200">
						<a 
							href="#features" 
							onClick={() => setMobileMenuOpen(false)}
							className="block text-base font-semibold text-stone-700 hover:text-stone-900"
						>
							Features
						</a>
						<a 
							href="#demo" 
							onClick={() => setMobileMenuOpen(false)}
							className="block text-base font-semibold text-stone-700 hover:text-stone-900"
						>
							Live Demo
						</a>
						<a 
							href="#how-it-works" 
							onClick={() => setMobileMenuOpen(false)}
							className="block text-base font-semibold text-stone-700 hover:text-stone-900"
						>
							How it Works
						</a>
						<a 
							href="#contact" 
							onClick={() => setMobileMenuOpen(false)}
							className="block text-base font-semibold text-stone-700 hover:text-stone-900"
						>
							Contact
						</a>
						<div className="h-px bg-stone-200 my-4" />
						<div className="grid grid-cols-2 gap-4 pt-2">
							<Link 
								href="/menu/sabay-kitchen"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-center h-11 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 bg-white"
							>
								Demo Menu
							</Link>
							<Link 
								href="/admin"
								onClick={() => setMobileMenuOpen(false)}
								className="flex items-center justify-center h-11 rounded-xl border border-stone-200 text-sm font-bold text-stone-700 bg-white"
							>
								Admin Panel
							</Link>
						</div>
						<a 
							href="https://t.me/S_David7" 
							target="_blank"
							rel="noopener noreferrer"
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f1f15] h-12 text-sm font-bold uppercase tracking-wider text-white shadow-md"
						>
							<Send className="size-4" />
							<span>Get Started via Telegram</span>
						</a>
					</div>
				)}
			</header>

			{/* Hero Section */}
			<section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-950">
				{/* Background Image with elegant overlay */}
				<div className="absolute inset-0 z-0">
					<Image 
						src="/hero-bg.png" 
						alt="Premium dining room table with QR Menu" 
						fill
						priority
						className="object-cover opacity-35 object-center scale-102 transition-transform duration-10000 ease-out"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-transparent to-stone-950" />
				</div>

				<div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
					<div className="inline-flex items-center gap-2 rounded-full border border-[#c5a880]/30 bg-[#c5a880]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#c5a880] uppercase mb-8 backdrop-blur-xs">
						<Sparkles className="size-3 text-[#c5a880] animate-pulse" />
						<span>The Next Generation of Dining</span>
					</div>
					
					<h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
						A Legacy of Flavor, <br className="hidden sm:inline" />
						<span className="text-[#c5a880] italic">Presented Digitally</span>
					</h1>

					<p className="mx-auto max-w-2xl text-lg sm:text-xl text-stone-300 font-normal leading-relaxed mb-10">
						Experience the soulful elegance of modern guest service. 
						QR Menu transforms traditional food presentations into highly responsive, 
						beautiful digital menus with local translations and instant updates.
					</p>

					<div className="flex flex-col sm:flex-row justify-center items-center gap-4">
						<Link 
							href="/menu/sabay-kitchen"
							className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#c5a880] hover:bg-[#b49770] px-8 py-4 text-sm font-bold uppercase tracking-widest text-stone-950 shadow-lg active:scale-98 transition-all"
						>
							<span>Explore Live Demo</span>
							<ChevronRight className="size-4 text-stone-950 stroke-[3]" />
						</Link>
						<a 
							href="#contact"
							className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-xs transition-all"
						>
							<QrCode className="size-4" />
							<span>Get Your QR Code</span>
						</a>
					</div>
				</div>
			</section>

			{/* SaaS Features Section */}
			<section id="features" className="py-24 sm:py-32 bg-white relative">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-50 via-transparent to-transparent opacity-60 pointer-events-none" />
				
				<div className="relative mx-auto max-w-7xl px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center mb-20">
						<span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880]">Product Excellence</span>
						<h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-900">
							Why Premium Restaurants Choose Us
						</h2>
						<div className="mx-auto mt-4 h-0.5 w-16 bg-[#c5a880]" />
						<p className="mt-4 text-base sm:text-lg text-stone-500 max-w-2xl mx-auto">
							Standard QR menus look like generic spreadsheets. QR Menu is crafted to match the aesthetic integrity of high-end eateries, ensuring your guest experience is seamless.
						</p>
					</div>

					<div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-2 lg:gap-16">
						{features.map((feature, idx) => (
							<div key={idx} className="flex gap-4 p-6 rounded-2xl border border-stone-100 hover:border-stone-200/80 hover:shadow-xs transition-all duration-300">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 border border-stone-200/60 shadow-xs">
									{feature.icon}
								</div>
								<div>
									<h3 className="text-lg font-bold text-stone-900">{feature.title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-stone-500 font-medium">
										{feature.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Interactive Live Demo Preview Section */}
			<section id="demo" className="py-24 sm:py-32 bg-stone-50 border-t border-b border-stone-200/50">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
						
						{/* Text Content */}
						<div className="lg:col-span-5 text-left">
							<span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880]">Interactive Showcase</span>
							<h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
								Experience It Like Your Customers Do
							</h2>
							<p className="mt-4 text-base text-stone-600 leading-relaxed font-medium">
								Take control of your dining experience. Below is an interactive demonstration. Open the Live Demo Menu to see how fluid, elegant, and fast the menu acts on a real mobile device.
							</p>
							
							<div className="mt-8 space-y-4">
								<div className="flex items-center gap-3">
									<CheckCircle2 className="size-5 text-[#c5a880]" />
									<span className="text-sm font-semibold text-stone-700">Perfect representation of your food photos</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle2 className="size-5 text-[#c5a880]" />
									<span className="text-sm font-semibold text-stone-700">Instant English/Khmer switching</span>
								</div>
								<div className="flex items-center gap-3">
									<CheckCircle2 className="size-5 text-[#c5a880]" />
									<span className="text-sm font-semibold text-stone-700">Clean, fluid UI sheet details</span>
								</div>
							</div>

							<div className="mt-10">
								<Link
									href="/menu/sabay-kitchen"
									className="inline-flex items-center gap-2 rounded-full bg-[#0f1f15] hover:bg-[#1a3324] px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md active:scale-95 transition-all"
								>
									<span>View Full Screen Demo</span>
									<ChevronRight className="size-3.5 text-white" />
								</Link>
							</div>
						</div>

						{/* Phone Mockup Frame */}
						<div className="lg:col-span-7 flex justify-center">
							<div className="relative w-full max-w-[340px] aspect-[9/18.5] bg-stone-950 rounded-[40px] p-3 shadow-2xl border-[6px] border-stone-800 outline-none ring-12 ring-stone-900/5 overflow-hidden">
								{/* Speaker slot / Dynamic Island notch */}
								<div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-950 rounded-full z-30 flex items-center justify-center">
									<div className="w-10 h-1 bg-stone-800 rounded-full" />
								</div>
								
								{/* Mock Screen Content (Mini Sabay Kitchen mockup) */}
								<div className="relative w-full h-full bg-stone-50 rounded-[30px] overflow-y-auto scrollbar-none flex flex-col pt-6 text-left text-xs select-none">
									
									{/* Mini Header */}
									<div className="px-3 py-2.5 border-b border-stone-200 bg-stone-100/90 sticky top-0 z-20 flex justify-between items-center">
										<div>
											<p className="text-[8px] font-bold text-[#c5a880] tracking-widest uppercase">Digital Menu</p>
											<p className="font-serif font-black text-stone-900 mt-0.5">SABAY KITCHEN</p>
										</div>
										<div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2 py-0.5 rounded-full text-[9px] font-bold text-stone-600">
											<Globe className="size-2.5 text-stone-400" />
											<span>ខ្មែរ</span>
										</div>
									</div>

									{/* Mini Banner */}
									<div className="m-3 p-3.5 rounded-xl bg-gradient-to-br from-[#0f1f15] to-[#1e3d2a] text-white relative overflow-hidden">
										<p className="text-[8px] uppercase tracking-wider text-[#c5a880] font-bold">Welcome to our table</p>
										<p className="font-bold text-xs mt-0.5">Fresh Sabay Kitchen flavours, served today.</p>
										<p className="mt-2 text-[8px] bg-white/10 w-fit px-1.5 py-0.5 rounded-full">Main dining room</p>
									</div>

									{/* Mini Categories */}
									<div className="px-3 py-1.5 bg-white border-b border-stone-100 flex gap-1 overflow-x-auto scrollbar-none">
										<span className="bg-[#0f1f15] text-[#c5a880] px-2.5 py-0.5 rounded-full text-[9px] font-bold shrink-0">Khmer favourites</span>
										<span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0">Noodles & rice</span>
										<span className="bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0">Drinks</span>
									</div>

									{/* Mini Items List */}
									<div className="p-3 space-y-2.5 flex-1">
										<div className="flex gap-2.5 p-2 rounded-lg border border-stone-150 bg-white">
											<div className="size-12 shrink-0 bg-stone-100 rounded-md relative flex items-center justify-center font-bold text-[#0f1f15] text-[10px]">
												AMOK
											</div>
											<div className="flex-1 flex flex-col justify-between py-0.5">
												<div>
													<p className="font-bold text-stone-900 text-[10px] leading-tight">Fish Amok</p>
													<p className="text-[8px] text-stone-400">Steamed fish curry...</p>
												</div>
												<div className="flex justify-between items-end mt-1">
													<span className="text-[8px] text-stone-400">$7.00</span>
													<span className="font-bold text-[10px] text-[#0f1f15]">28,000 ៛</span>
												</div>
											</div>
										</div>

										<div className="flex gap-2.5 p-2 rounded-lg border border-stone-150 bg-white">
											<div className="size-12 shrink-0 bg-stone-100 rounded-md relative flex items-center justify-center font-bold text-[#0f1f15] text-[10px]">
												LOK
											</div>
											<div className="flex-1 flex flex-col justify-between py-0.5">
												<div>
													<p className="font-bold text-stone-900 text-[10px] leading-tight">Beef Lok Lak</p>
													<p className="text-[8px] text-stone-400">Tender beef, pepper-lime...</p>
												</div>
												<div className="flex justify-between items-end mt-1">
													<span className="text-[8px] text-stone-400">$6.50</span>
													<span className="font-bold text-[10px] text-[#0f1f15]">26,000 ៛</span>
												</div>
											</div>
										</div>

										<div className="flex gap-2.5 p-2 rounded-lg border border-[#c5a880]/30 bg-[#c5a880]/5">
											<div className="size-12 shrink-0 bg-stone-100 rounded-md relative flex items-center justify-center font-bold text-[#0f1f15] text-[10px]">
												COFF
											</div>
											<div className="flex-1 flex flex-col justify-between py-0.5">
												<div>
													<p className="font-bold text-stone-900 text-[10px] leading-tight">Iced Khmer Coffee</p>
													<p className="text-[8px] text-stone-400">Strong local coffee...</p>
												</div>
												<div className="flex justify-between items-end mt-1">
													<span className="text-[8px] text-stone-400">$2.00</span>
													<span className="font-bold text-[10px] text-[#0f1f15]">8,000 ៛</span>
												</div>
											</div>
										</div>
									</div>

								</div>
							</div>
						</div>

					</div>
				</div>
			</section>

			{/* How it Works / Onboarding Flow */}
			<section id="how-it-works" className="py-24 sm:py-32 bg-white">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="mx-auto max-w-3xl text-center mb-20">
						<span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880]">Simple Onboarding</span>
						<h2 className="mt-3 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
							Launch Your QR Menu in 3 Easy Steps
						</h2>
						<div className="mx-auto mt-4 h-0.5 w-16 bg-[#c5a880]" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
						{steps.map((step, idx) => (
							<div key={idx} className="relative text-center p-8 bg-stone-50 border border-stone-100 rounded-2xl transition-all duration-350 hover:bg-stone-100/60 group">
								<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-[#0f1f15] border-2 border-white shadow-md text-white font-bold text-sm tracking-wide">
									{step.num}
								</div>
								<h3 className="mt-4 text-lg font-bold text-stone-900 group-hover:text-[#c5a880] transition-colors">{step.title}</h3>
								<p className="mt-3 text-sm text-stone-500 leading-relaxed font-medium">
									{step.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Telegram Contact & QR Code Section */}
			<section id="contact" className="py-24 sm:py-32 bg-[#0f1f15] text-white relative overflow-hidden">
				{/* Background design elements */}
				<div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-[#c5a880]/5 blur-3xl" />
				<div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/5 blur-3xl" />

				<div className="relative mx-auto max-w-5xl px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
						
						{/* Info and Buttons */}
						<div className="md:col-span-7 text-left">
							<span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880]">Get Started Today</span>
							<h2 className="mt-3 font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
								Ready to Elevate Your Dining Service?
							</h2>
							<p className="mt-6 text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
								We are here to help you get set up quickly. Scan the contact card QR code with your smartphone, or click the button below to message us directly on Telegram.
							</p>

							<div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
								<a 
									href="https://t.me/S_David7" 
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center gap-3 rounded-full bg-[#c5a880] hover:bg-[#b49770] px-8 py-4 text-sm font-bold uppercase tracking-wider text-stone-950 shadow-md active:scale-95 transition-all shrink-0"
								>
									<MessageSquare className="size-4 text-stone-950 stroke-[2.5]" />
									<span>Chat on Telegram</span>
								</a>
								<div className="flex items-center justify-center gap-2 text-stone-400 text-xs px-2.5 py-1">
									<CheckCircle2 className="size-3.5 text-[#c5a880]" />
									<span>Active Support (EN/KH)</span>
								</div>
							</div>
						</div>

						{/* QR Code Container */}
						<div className="md:col-span-5 flex justify-center">
							<div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white/10 text-stone-950 w-full max-w-[320px] text-center transform transition-transform hover:scale-102 duration-300">
								<p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c5a880] mb-4">Telegram Support</p>
								
								<div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/50 p-2 shadow-inner mb-4">
									<Image 
										src="/telegram-contact-qr.png" 
										alt="Scan to contact QR Menu support on Telegram" 
										fill
										className="object-contain p-2"
									/>
								</div>

								<p className="text-xs font-bold text-stone-850 tracking-wide uppercase">Scan to Message</p>
								<p className="text-[10px] text-stone-400 font-medium mt-0.5">Telegram: @S_David7</p>
							</div>
						</div>

					</div>
				</div>
			</section>

			{/* Elegant Footer */}
			<footer className="bg-stone-950 text-stone-500 py-12 border-t border-stone-900">
				<div className="mx-auto max-w-7xl px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-stone-900 pb-8 mb-8">
						{/* Logo */}
						<div className="flex items-center gap-2">
							<div className="flex size-7 items-center justify-center rounded bg-white/5 text-[#c5a880]">
								<Utensils className="size-4" />
							</div>
							<span className="font-serif text-sm font-bold tracking-[0.2em] text-white uppercase">
								QR Menu
							</span>
						</div>

						{/* Links */}
						<div className="flex flex-wrap justify-center gap-8 text-xs font-semibold tracking-wider uppercase text-stone-400">
							<a href="#features" className="hover:text-white transition-colors">Features</a>
							<a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
							<a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
							<a href="#contact" className="hover:text-white transition-colors">Contact</a>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
						<p>© {new Date().getFullYear()} QR Menu. All rights reserved.</p>
						<p className="text-stone-600">Created for luxury, traditional, and modern restaurants across Cambodia.</p>
					</div>
				</div>
			</footer>

		</div>
	);
}
