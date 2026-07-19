"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, Loader2, Sparkles, UtensilsCrossed, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setToast(null);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			if (res.ok) {
				setToast({
					type: "success",
					message: "Login successful! Redirecting to dashboard...",
				});
				setTimeout(() => {
					router.push("/admin/menu-items");
					router.refresh();
				}, 1500);
			} else {
				const data = await res.json() as { error?: string };
				setToast({
					type: "error",
					message: data.error || "Invalid username or password.",
				});
				setLoading(false);
			}
		} catch (err) {
			setToast({
				type: "error",
				message: "A network error occurred. Please try again.",
			});
			setLoading(false);
		}
	}

	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 p-4 font-sans select-none text-stone-900">
			{/* Toast Popup Notification */}
			{toast && (
				<div
					role="alert"
					className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3.5 shadow-lg border text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
						toast.type === "success"
							? "bg-green-50 border-green-200 text-green-800"
							: "bg-red-50 border-red-200 text-red-800"
					}`}
				>
					{toast.type === "success" ? (
						<CheckCircle2 className="size-5 text-green-600 shrink-0" />
					) : (
						<AlertTriangle className="size-5 text-red-600 shrink-0" />
					)}
					<span>{toast.message}</span>
				</div>
			)}

			{/* Decorative background grid */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

			<div className="relative w-full max-w-[420px] z-10">
				{/* Top Branding / Logo */}
				<div className="flex flex-col items-center mb-8">
					<div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/10">
						<UtensilsCrossed className="size-7" />
					</div>
					<h2 className="mt-4 text-2xl font-black tracking-tight text-stone-900">
						QRMenu Backoffice
					</h2>
					<p className="mt-1 text-sm text-stone-500">
						Sign in to manage your digital restaurant menu.
					</p>
				</div>

				<Card className="border border-stone-200 bg-white/95 backdrop-blur-md shadow-xl">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-xl font-bold text-stone-900">Welcome back</CardTitle>
						<CardDescription className="text-stone-500 text-xs">
							Enter your admin credentials below to access the dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="grid gap-4">
							<div className="grid gap-2">
								<label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-stone-500">
									Username
								</label>
								<div className="relative flex items-center">
									<User className="absolute left-3.5 size-4 text-stone-400 pointer-events-none" />
									<Input
										id="username"
										type="text"
										required
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="min-h-11 bg-white border-stone-200 text-stone-900 placeholder-stone-400 pl-10 focus-visible:ring-primary focus-visible:border-primary"
										placeholder="Enter your username"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-stone-500">
									Password
								</label>
								<div className="relative flex items-center">
									<KeyRound className="absolute left-3.5 size-4 text-stone-400 pointer-events-none" />
									<Input
										id="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="min-h-11 bg-white border-stone-200 text-stone-900 placeholder-stone-400 pl-10 focus-visible:ring-primary focus-visible:border-primary"
										placeholder="Enter your password"
									/>
								</div>
							</div>

							<Button type="submit" disabled={loading} className="min-h-11 mt-2 text-sm font-semibold tracking-wide bg-primary text-white hover:bg-primary/95 transition-colors shadow-xs">
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
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
