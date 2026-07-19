"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Schedule = {
	id: string;
	name: string;
	status: "active" | "inactive";
	priority: number;
	windows: string;
	itemCount: number;
};

type Item = {
	id: string;
	nameEn: string;
	status: string;
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const time = (minute: number) =>
	`${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

export default function SchedulesPage() {
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	// Form states
	const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	async function load() {
		try {
			const [s, i] = await Promise.all([
				fetch("/api/admin/schedules"),
				fetch("/api/admin/menu-items")
			]);
			const schedulesData = (await s.json()) as Schedule[];
			const itemsData = (await i.json()) as Item[];
			
			setSchedules(schedulesData);
			setItems(itemsData);
			// Initialize selected items as active items
			setSelectedItems(itemsData.filter(item => item.status === "active").map(item => item.id));
		} catch (err) {
			console.error("Failed to load schedules", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function save(form: FormData) {
		setError("");
		const startStr = form.get("start") as string;
		const endStr = form.get("end") as string;
		
		const start = startStr.split(":").map(Number);
		const end = endStr.split(":").map(Number);
		
		const r = await fetch("/api/admin/schedules", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: form.get("name"),
				startMinute: start[0] * 60 + start[1],
				endMinute: end[0] * 60 + end[1],
				days: selectedDays,
				itemIds: selectedItems,
			}),
		});

		if (!r.ok) {
			const body = (await r.json()) as { error?: string };
			setError(body.error || "Could not save schedule.");
			return;
		}

		setShow(false);
		// Reset form states
		setSelectedDays([1, 2, 3, 4, 5, 6, 7]);
		await load();
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Schedules</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Control which active menu items are shown at each time.
					</p>
				</div>
				{!show && (
					<Button onClick={() => setShow(true)} className="min-h-11 shrink-0">
						<Plus className="size-4 mr-1" />
						Create schedule
					</Button>
				)}
			</div>

			{show && (
				<Card className="border shadow-xs">
					<CardHeader>
						<CardTitle>New menu schedule</CardTitle>
						<CardDescription>
							Items become visible when this schedule is active in Cambodia time.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={save} className="grid gap-6">
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="grid gap-2 sm:col-span-1">
									<label htmlFor="name" className="text-sm font-semibold text-stone-700">
										Schedule name
									</label>
									<Input id="name" required name="name" placeholder="Lunch" className="min-h-11" />
								</div>
								<div className="grid gap-2">
									<label htmlFor="start" className="text-sm font-semibold text-stone-700">
										Start
									</label>
									<Input id="start" name="start" type="time" defaultValue="11:00" required className="min-h-11" />
								</div>
								<div className="grid gap-2">
									<label htmlFor="end" className="text-sm font-semibold text-stone-700">
										End
									</label>
									<Input id="end" name="end" type="time" defaultValue="14:00" required className="min-h-11" />
								</div>
							</div>

							<fieldset className="grid gap-2.5">
								<legend className="text-sm font-semibold text-stone-700">Days</legend>
								<div className="flex flex-wrap gap-2">
									{weekdays.map((day, index) => {
										const dayNum = index + 1;
										const isSelected = selectedDays.includes(dayNum);
										return (
											<button
												key={day}
												type="button"
												onClick={() => {
													setSelectedDays((prev) =>
														prev.includes(dayNum)
															? prev.filter((d) => d !== dayNum)
															: [...prev, dayNum]
													);
												}}
												className={`h-9 px-4.5 rounded-full font-semibold text-xs transition-all border ${
													isSelected
														? "bg-primary text-primary-foreground border-primary shadow-xs"
														: "bg-background hover:bg-stone-50 border-stone-200 text-stone-600"
												}`}
											>
												{day}
											</button>
										);
									})}
								</div>
							</fieldset>

							<fieldset className="grid gap-2.5">
								<legend className="text-sm font-semibold text-stone-700">Menu items</legend>
								<div className="grid gap-3 sm:grid-cols-2 max-h-60 overflow-y-auto p-1 border rounded-xl bg-stone-50/50">
									{items.map((item) => {
										const isSelected = selectedItems.includes(item.id);
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => {
													setSelectedItems((prev) =>
														prev.includes(item.id)
															? prev.filter((id) => id !== item.id)
															: [...prev, item.id]
													);
												}}
												className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all ${
													isSelected
														? "border-primary bg-primary/5 text-primary font-semibold shadow-2xs"
														: "border-stone-200 bg-white text-stone-600 hover:bg-stone-50/75"
												}`}
											>
												<span className="truncate">{item.nameEn}</span>
												<div
													className={`size-4.5 shrink-0 rounded border flex items-center justify-center transition-colors ${
														isSelected
															? "bg-primary border-primary text-primary-foreground"
															: "border-stone-300 bg-white"
													}`}
												>
													{isSelected && (
														<svg className="size-3 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
														</svg>
													)}
												</div>
											</button>
										);
									})}
								</div>
							</fieldset>

							{error && (
								<p role="alert" className="text-sm text-destructive font-medium">
									{error}
								</p>
							)}

							<div className="flex justify-end gap-3 border-t pt-4">
								<Button type="button" variant="outline" onClick={() => setShow(false)} className="h-11">
									Cancel
								</Button>
								<Button type="submit" className="h-11">Create schedule</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			<Card className="border shadow-xs">
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
							<Loader2 className="size-8 animate-spin text-primary mb-2" />
							<span>Loading schedules…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{schedules.map((s) => (
								<div key={s.id} className="flex items-center justify-between gap-4 p-4.5 hover:bg-stone-50/30 transition-colors">
									<div>
										<p className="font-semibold text-stone-900">{s.name}</p>
										<p className="mt-1 text-xs text-muted-foreground font-medium">
											{s.windows
												.split(",")
												.map((w) => {
													const [start, end] = w.split("-").map((v) => v.split(":").map(Number));
													return `${weekdays[start[0] - 1]} ${time(start[1])}–${time(end[1])}`;
												})
												.join(" · ")}
										</p>
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<span className="text-xs font-semibold text-muted-foreground">
											{s.itemCount} items
										</span>
										<Badge variant={s.status === "active" ? "default" : "secondary"} className="capitalize">
											{s.status}
										</Badge>
									</div>
								</div>
							))}

							{schedules.length === 0 && (
								<div className="text-center p-12 text-muted-foreground">
									<Calendar className="mx-auto size-8 text-stone-300 mb-2" />
									<p className="font-semibold text-stone-850">No schedules created yet</p>
									<p className="text-xs text-muted-foreground mt-0.5">Click Create Schedule above to set availability.</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}

