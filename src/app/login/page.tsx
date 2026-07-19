"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Loader2, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (res.ok) {
				router.push("/admin/menu-items");
				router.refresh();
			} else {
				const data = await res.json() as { error?: string };
				setError(data.error || "Invalid credentials. Please try again.");
			}
		} catch (err) {
			setError("A network error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 p-4 font-sans select-none">
			{/* Decorative background grid and glow */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0a09_1px,transparent_1px),linear-gradient(to_bottom,#0c0a09_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-85" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

			<div className="relative w-full max-w-[420px] z-10">
				{/* Top Branding / Logo */}
				<div className="flex flex-col items-center mb-8">
					<div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
						<UtensilsCrossed className="size-7" />
					</div>
					<h2 className="mt-4 text-2xl font-black tracking-tight text-white">
						QRMenu Backoffice
					</h2>
					<p className="mt-1 text-sm text-stone-400">
						Sign in to manage your digital restaurant menu.
					</p>
				</div>

				<Card className="border border-stone-850 bg-stone-900/60 backdrop-blur-xl shadow-2xl">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-xl font-bold text-white">Welcome back</CardTitle>
						<CardDescription className="text-stone-400 text-xs">
							Enter your credentials below to access the admin dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="grid gap-4">
							<div className="grid gap-2">
								<label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-stone-400">
									Email address
								</label>
								<div className="relative flex items-center">
									<Mail className="absolute left-3.5 size-4 text-stone-500 pointer-events-none" />
									<Input
										id="email"
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="min-h-11 bg-stone-950/50 border-stone-800 text-white placeholder-stone-650 pl-10 focus-visible:ring-primary focus-visible:border-primary"
										placeholder="admin@qrmenu.com"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-stone-400">
										Password
									</label>
								</div>
								<div className="relative flex items-center">
									<KeyRound className="absolute left-3.5 size-4 text-stone-500 pointer-events-none" />
									<Input
										id="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="min-h-11 bg-stone-950/50 border-stone-800 text-white placeholder-stone-650 pl-10 focus-visible:ring-primary focus-visible:border-primary"
										placeholder="••••••••"
									/>
								</div>
							</div>

							{error && (
								<p role="alert" className="text-sm font-medium text-red-400 mt-1">
									{error}
								</p>
							)}

							<Button type="submit" disabled={loading} className="min-h-11 mt-2 text-sm font-semibold tracking-wide bg-primary text-white hover:bg-primary/95 transition-colors">
								{loading ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Authenticating…
									</>
								) : (
									"Sign In"
								)}
							</Button>
						</form>

						{/* Quick Fill Suggestion */}
						<div className="mt-6 border-t border-stone-850 pt-5 text-center">
							<div className="inline-flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-950/40 px-3 py-1 text-[11px] text-stone-450">
								<Sparkles className="size-3 text-primary animate-pulse" />
								<span>Quick demo: click credentials to fill</span>
							</div>
							<div className="mt-3 flex flex-col gap-1.5 items-center justify-center text-xs">
								<button
									type="button"
									onClick={() => {
										setEmail("admin@qrmenu.com");
										setPassword("admin");
									}}
									className="group text-stone-400 hover:text-white transition-colors"
								>
									Email: <span className="underline decoration-stone-700 group-hover:decoration-white font-medium text-stone-300">admin@qrmenu.com</span>
								</button>
								<button
									type="button"
									onClick={() => {
										setEmail("admin@qrmenu.com");
										setPassword("admin");
									}}
									className="group text-stone-400 hover:text-white transition-colors"
								>
									Password: <span className="underline decoration-stone-700 group-hover:decoration-white font-medium text-stone-300">admin</span>
								</button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
