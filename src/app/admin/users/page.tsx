"use client";

import { useEffect, useState } from "react";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
	id: string;
	email: string;
	displayName: string;
	role: string;
	status: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [show, setShow] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [role, setRole] = useState("editor");

	async function load() {
		try {
			const r = await fetch("/api/admin/users");
			if (r.ok) {
				setUsers((await r.json()) as User[]);
			}
		} catch (err) {
			console.error("Failed to load users", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, []);

	async function invite(form: FormData) {
		setError("");
		const data = Object.fromEntries(form);
		
		// Ensure custom role from select state is sent
		const r = await fetch("/api/admin/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...data,
				role,
			}),
		});

		if (!r.ok) {
			const body = (await r.json()) as { error?: string };
			setError(body.error || "Could not add user.");
			return;
		}

		setShow(false);
		setError("");
		await load();
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Users</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage restaurant roles. Cloudflare Access controls sign-in at deployment.
					</p>
				</div>
				{!show && (
					<Button className="min-h-11 shrink-0" onClick={() => setShow(true)}>
						<Plus className="size-4 mr-1" />
						Add user
					</Button>
				)}
			</div>

			{show && (
				<Card className="max-w-2xl border shadow-xs">
					<CardHeader>
						<CardTitle>Add staff member</CardTitle>
						<CardDescription>
							Configure the same email in your Cloudflare Access policy before they can sign in.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={invite} className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="displayName" className="text-sm font-semibold text-stone-700">
									Name
								</label>
								<Input id="displayName" name="displayName" required className="min-h-11" />
							</div>
							<div className="grid gap-2">
								<label htmlFor="email" className="text-sm font-semibold text-stone-700">
									Email
								</label>
								<Input id="email" name="email" type="email" required className="min-h-11" />
							</div>
							<div className="grid gap-2 sm:col-span-2">
								<label htmlFor="roleSelect" className="text-sm font-semibold text-stone-700">
									Role
								</label>
								<input type="hidden" name="role" value={role} />
								<Select value={role} onValueChange={(val) => setRole(val || "editor")}>
									<SelectTrigger className="w-full h-11" id="roleSelect">
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="owner">Owner</SelectItem>
										<SelectItem value="manager">Manager</SelectItem>
										<SelectItem value="editor">Editor</SelectItem>
										<SelectItem value="viewer">Viewer</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{error && (
								<p role="alert" className="text-sm text-destructive font-medium sm:col-span-2">
									{error}
								</p>
							)}

							<div className="flex justify-end gap-3 sm:col-span-2 border-t pt-4">
								<Button type="button" variant="outline" onClick={() => setShow(false)} className="h-11">
									Cancel
								</Button>
								<Button className="h-11">Add user</Button>
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
							<span>Loading users list…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{users.map((user) => (
								<div key={user.id} className="flex items-center justify-between gap-4 p-4.5 hover:bg-stone-50/30 transition-colors">
									<div>
										<p className="font-semibold text-stone-900">{user.displayName}</p>
										<p className="mt-1 text-sm text-muted-foreground font-medium">{user.email}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline" className="capitalize">
											{user.role}
										</Badge>
										<Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">
											{user.status}
										</Badge>
									</div>
								</div>
							))}

							{users.length === 0 && (
								<div className="text-center p-12 text-muted-foreground">
									<UserPlus className="mx-auto size-8 text-stone-300 mb-2" />
									<p className="font-semibold text-stone-850">No staff members yet</p>
									<p className="text-xs text-muted-foreground mt-0.5">Click Add User above to invite staff.</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}

