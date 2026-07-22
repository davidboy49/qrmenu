"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";
import { getRestaurantDetails, updateRestaurantAction, getActiveContextDetails } from "../actions";

export default function SettingsPage() {
	const [details, setDetails] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [logoAssetId, setLogoAssetId] = useState<string | null>(null);

	useEffect(() => {
		async function fetchDetails() {
			try {
				const context = await getActiveContextDetails();
				const restaurant = await getRestaurantDetails(context.restaurantId);
				setDetails(restaurant);
				setLogoAssetId(restaurant.logoAssetId);
			} catch (err: any) {
				setError("Failed to load restaurant details");
			} finally {
				setLoading(false);
			}
		}
		void fetchDetails();
	}, []);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!details) return;
		setSaving(true);
		setError("");
		setSuccess("");
		
		const form = new FormData(e.currentTarget);
		const name = form.get("name") as string;
		const timezone = form.get("timezone") as string;
		const defaultLocale = form.get("defaultLocale") as string;
		
		try {
			await updateRestaurantAction(details.id, {
				name,
				timezone,
				defaultLocale,
				logoAssetId
			});
			setSuccess("Restaurant settings updated successfully!");
		} catch (err: any) {
			setError(err.message || "Failed to update restaurant settings");
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center p-8">
				<div className="flex flex-col items-center gap-2 text-stone-500">
					<Loader2 className="size-8 animate-spin text-primary" />
					<span>Loading settings…</span>
				</div>
			</main>
		);
	}

	if (!details) {
		return (
			<main className="flex flex-1 flex-col p-6">
				<div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
					<AlertCircle className="size-5" />
					<p className="font-semibold">{error}</p>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div>
				<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 text-stone-900">
					<Settings className="size-8 text-primary" />
					Restaurant Settings
				</h1>
				<p className="mt-1 text-sm text-stone-500">
					Manage the core details and branding for {details.name}.
				</p>
			</div>

			<Card className="max-w-2xl border-stone-200 shadow-xs">
				<CardHeader>
					<CardTitle>General Information</CardTitle>
					<CardDescription>Update your restaurant&apos;s name, timezone, and logo.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-6">
						<div className="grid gap-2">
							<label htmlFor="name" className="text-sm font-semibold text-stone-700">
								Restaurant Name
							</label>
							<Input 
								required 
								id="name" 
								name="name" 
								defaultValue={details.name}
								className="min-h-11" 
							/>
						</div>
						
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="timezone" className="text-sm font-semibold text-stone-700">
									Timezone
								</label>
								<Input 
									required 
									id="timezone" 
									name="timezone" 
									defaultValue={details.timezone}
									className="min-h-11" 
								/>
							</div>
							
							<div className="grid gap-2">
								<label htmlFor="defaultLocale" className="text-sm font-semibold text-stone-700">
									Default Locale
								</label>
								<select 
									id="defaultLocale" 
									name="defaultLocale" 
									defaultValue={details.defaultLocale}
									className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<option value="km-KH">Khmer (km-KH)</option>
									<option value="en">English (en)</option>
								</select>
							</div>
						</div>
						
						<div className="grid gap-2 border-t pt-5 mt-2">
							<label className="text-sm font-semibold text-stone-700">
								Restaurant Logo
							</label>
							<p className="text-xs text-stone-500 mb-2">Upload a logo to display on your public menus and receipts. Recommended 1:1 aspect ratio.</p>
							<div className="max-w-xs">
								<ImageUpload 
									value={logoAssetId} 
									onChange={setLogoAssetId} 
									name="logoAssetId"
								/>
							</div>
						</div>
						
						{error && (
							<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
								<AlertCircle className="size-4 shrink-0" />
								<span>{error}</span>
							</div>
						)}
						
						{success && (
							<div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
								<span className="flex size-5 items-center justify-center rounded-full bg-green-100 shrink-0">✓</span>
								<span>{success}</span>
							</div>
						)}
						
						<div className="flex justify-end gap-3 border-t pt-5">
							<Button type="submit" disabled={saving} className="h-11 px-6">
								{saving ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Saving…
									</>
								) : (
									"Save Settings"
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
