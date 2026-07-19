"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { 
	Plus, 
	UserPlus, 
	Loader2, 
	Trash2, 
	Lock, 
	Unlock, 
	Building2, 
	ShieldCheck, 
	Mail, 
	User, 
	AlertCircle,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
	getSession, 
	getRestaurantsList, 
	createStaffUserAction, 
	deleteStaffUserAction, 
	updateStaffUserStatusAction,
	getActiveContextDetails
} from "../actions";
import type { Restaurant } from "@/lib/server/menu-repository";

type ClientUser = {
	id: string;
	email: string;
	displayName: string;
	role: string;
	status: string;
	restaurant_names?: string;
	restaurant_ids?: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<ClientUser[]>([]);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [session, setSession] = useState<{ role: string } | null>(null);
	
	// Pagination States
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const [showForm, setShowForm] = useState(false);
	const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [isPending, startTransition] = useTransition();

	// Add Form States
	const [error, setError] = useState("");
	const [role, setRole] = useState("editor");

	// Edit Form States
	const [editName, setEditName] = useState("");
	const [editRole, setEditRole] = useState("editor");
	const [editPassword, setEditPassword] = useState("");
	const [editRestaurants, setEditRestaurants] = useState<string[]>([]);
	const [editError, setEditError] = useState("");

	const isSuperAdmin = session?.role === "admin";

	async function load() {
		setLoading(true);
		try {
			const s = await getSession();
			setSession(s);

			const r = await fetch(`/api/admin/users?page=${page}&limit=20`);
			if (r.ok) {
				const data = (await r.json()) as { users: ClientUser[]; totalPages: number; totalCount: number };
				setUsers(data.users || []);
				setTotalPages(data.totalPages || 1);
				setTotalCount(data.totalCount || 0);
			}

			if (s?.role === "admin") {
				const list = await getRestaurantsList();
				setRestaurants(list);
			}
		} catch (err) {
			console.error("Failed to load users", err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void load();
	}, [page]);

	// Pre-fill Edit Modal
	useEffect(() => {
		if (selectedUser) {
			setEditName(selectedUser.displayName);
			setEditRole(selectedUser.role);
			setEditPassword("");
			setEditError("");
			const ids = selectedUser.restaurant_ids ? selectedUser.restaurant_ids.split(", ") : [];
			setEditRestaurants(ids);
		}
	}, [selectedUser]);

	// Handle Create User
	async function handleAddUser(form: FormData) {
		setError("");
		const displayName = form.get("displayName") as string;
		const email = form.get("email") as string;
		const password = form.get("password") as string;

		let restaurantIds: string[] = [];
		if (isSuperAdmin) {
			restaurantIds = form.getAll("restaurantIds") as string[];
		} else {
			const context = await getActiveContextDetails();
			restaurantIds = [context.restaurantId];
		}

		if (!displayName) {
			setError("Name is required.");
			return;
		}

		if (restaurantIds.length === 0) {
			setError("Please assign at least one restaurant.");
			return;
		}

		if (password && password.length < 4) {
			setError("Password must be at least 4 characters.");
			return;
		}

		if (!confirm(`Are you sure you want to add the user "${displayName}"?`)) return;

		startTransition(async () => {
			try {
				await createStaffUserAction({
					email,
					displayName,
					role: role as any,
					restaurantIds,
					password: password || undefined
				});
				setShowForm(false);
				setError("");
				setRole("editor");
				setPage(1); // Reset to first page
				await load();
			} catch (err: any) {
				setError(err.message || "Failed to create user.");
			}
		});
	}

	// Handle Update User (Save from Modal)
	async function handleUpdateUser() {
		setEditError("");
		if (!editName) {
			setEditError("Name is required.");
			return;
		}

		if (isSuperAdmin && editRestaurants.length === 0) {
			setEditError("Please assign at least one restaurant.");
			return;
		}

		if (editPassword && editPassword.length < 4) {
			setEditError("Password must be at least 4 characters.");
			return;
		}

		if (!confirm(`Are you sure you want to save changes for "${selectedUser?.email}"?`)) return;

		startTransition(async () => {
			try {
				await createStaffUserAction({
					email: selectedUser!.email,
					displayName: editName,
					role: editRole as any,
					restaurantIds: editRestaurants,
					password: editPassword || undefined
				});
				setSelectedUser(null);
				await load();
			} catch (err: any) {
				setEditError(err.message || "Failed to update user.");
			}
		});
	}

	// Handle Delete User
	async function handleDeleteUser(userId: string, email: string) {
		if (!confirm(`Are you sure you want to permanently delete the user "${email}" from all assigned restaurants? This action cannot be undone.`)) {
			return;
		}

		startTransition(async () => {
			try {
				await deleteStaffUserAction(userId);
				setSelectedUser(null);
				await load();
			} catch (err: any) {
				alert(err.message || "Failed to delete user.");
			}
		});
	}

	// Handle Change User Status (suspend/activate)
	async function handleToggleStatus(userId: string, currentStatus: string) {
		const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
		const actionWord = nextStatus === "suspended" ? "suspend" : "activate";

		if (!confirm(`Are you sure you want to ${actionWord} this user across all assigned restaurants?`)) {
			return;
		}

		startTransition(async () => {
			try {
				await updateStaffUserStatusAction(userId, nextStatus);
				if (selectedUser) {
					setSelectedUser({ ...selectedUser, status: nextStatus });
				}
				await load();
			} catch (err: any) {
				alert(err.message || "Failed to update user status.");
			}
		});
	}

	// Toggle restaurant selection in Edit mode
	function toggleEditRestaurant(id: string) {
		if (editRestaurants.includes(id)) {
			setEditRestaurants(editRestaurants.filter((item) => item !== id));
		} else {
			setEditRestaurants([...editRestaurants, id]);
		}
	}

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center p-8 text-stone-400">
				<div className="flex flex-col items-center justify-center">
					<Loader2 className="size-8 animate-spin text-primary mb-2" />
					<span>Loading dashboard...</span>
				</div>
			</main>
		);
	}

	if (!session || session.role !== "admin") {
		return (
			<main className="flex min-h-screen items-center justify-center p-8 text-muted-foreground">
				<div className="flex flex-col items-center gap-2 text-center max-w-md">
					<Lock className="size-8 text-destructive animate-bounce" />
					<h2 className="text-lg font-bold text-stone-900 mt-2">Access Denied</h2>
					<p className="text-sm">Only the system-wide Global Admin has permission to view or manage users.</p>
					<Button variant="outline" nativeButton={false} render={<Link href="/admin" />} className="mt-4 min-h-11">
						Back to Dashboard
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2 text-stone-900">
						<ShieldCheck className="size-8 text-primary" />
						User Management
					</h1>
					<p className="mt-1 text-sm text-stone-500">
						{isSuperAdmin 
							? "Global backoffice user list. Manage passwords, roles, and restaurant assignments."
							: "Manage roles and team access for your restaurant location."}
					</p>
				</div>
				{!showForm && (
					<Button className="min-h-11 shrink-0" onClick={() => { setError(""); setShowForm(true); }}>
						<Plus className="size-4 mr-1" />
						Add User
					</Button>
				)}
			</div>

			{/* Create User Form */}
			{showForm && (
				<Card className="max-w-2xl border border-stone-250 bg-white shadow-xs">
					<CardHeader>
						<CardTitle>Add Staff Member</CardTitle>
						<CardDescription>
							{isSuperAdmin 
								? "Set credentials and select the organizations they are authorized to access."
								: "Add a staff member to your current restaurant context."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form 
							onSubmit={(e) => {
								e.preventDefault();
								void handleAddUser(new FormData(e.currentTarget));
							}}
							className="grid gap-4 sm:grid-cols-2"
						>
							<div className="grid gap-2">
								<label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Name
								</label>
								<Input id="displayName" name="displayName" required className="min-h-11" placeholder="e.g. John Doe" />
							</div>

							<div className="grid gap-2">
								<label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Email / Username (Optional)
								</label>
								<Input id="email" name="email" type="text" className="min-h-11" placeholder="e.g. john@example.com or johndoe" />
							</div>

							<div className="grid gap-2">
								<label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Password (Optional)
								</label>
								<Input id="password" name="password" type="password" className="min-h-11" placeholder="At least 4 chars" />
							</div>

							<div className="grid gap-2">
								<label htmlFor="roleSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500">
									Role
								</label>
								<Select value={role} onValueChange={(val) => setRole(val || "editor")}>
									<SelectTrigger className="w-full h-11" id="roleSelect">
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent className="bg-white">
										<SelectItem value="owner">Owner</SelectItem>
										<SelectItem value="manager">Manager</SelectItem>
										<SelectItem value="editor">Editor (Write access)</SelectItem>
										<SelectItem value="viewer">Viewer (Read only)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{isSuperAdmin && (
								<div className="grid gap-2 sm:col-span-2">
									<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Assigned Restaurants
									</label>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5 border border-stone-200 bg-white rounded-lg p-3.5 max-h-48 overflow-y-auto">
										{restaurants.map((r) => (
											<label key={r.id} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer select-none p-1 hover:bg-stone-50 rounded">
												<input 
													type="checkbox" 
													name="restaurantIds" 
													value={r.id} 
													className="rounded text-primary focus:ring-primary size-4 accent-stone-700" 
												/>
												<span>{r.name}</span>
											</label>
										))}
									</div>
								</div>
							)}

							{error && (
								<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3 sm:col-span-2">
									<AlertCircle className="size-4 shrink-0" />
									<span>{error}</span>
								</div>
							)}

							<div className="flex justify-end gap-3 sm:col-span-2 border-t pt-4">
								<Button 
									type="button" 
									variant="outline" 
									onClick={() => setShowForm(false)} 
									className="h-11 border-stone-200"
								>
									Cancel
								</Button>
								<Button type="submit" disabled={isPending} className="h-11 px-6">
									{isPending ? (
										<>
											<Loader2 className="size-4 animate-spin mr-2" />
											Saving…
										</>
									) : (
										"Add User"
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}

			{/* Users list table */}
			<Card className="border border-stone-200 bg-white shadow-xs">
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-stone-400">
							<Loader2 className="size-8 animate-spin text-primary mb-2" />
							<span>Loading users list…</span>
						</div>
					) : (
						<div className="divide-y divide-stone-100">
							{users.map((user) => (
								<div 
									key={user.id} 
									onClick={() => setSelectedUser(user)}
									className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-stone-50/40 transition-colors cursor-pointer"
								>
									<div className="flex items-start gap-3">
										<div className="mt-1 flex size-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 shrink-0">
											<User className="size-5" />
										</div>
										<div>
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-bold text-stone-900 text-base">{user.displayName}</span>
												<Badge variant="outline" className="capitalize text-xs font-semibold">
													{user.role}
												</Badge>
												<Badge 
													variant={user.status === "active" ? "default" : "secondary"} 
													className="capitalize text-[10px] font-bold"
												>
													{user.status}
												</Badge>
											</div>
											<div className="mt-2 flex flex-col gap-1.5 text-xs text-stone-500">
												<span className="flex items-center gap-1.5">
													<Mail className="size-3.5 text-stone-400 shrink-0" />
													{user.email}
												</span>
												{isSuperAdmin && user.restaurant_names && (
													<span className="flex items-center gap-1.5 flex-wrap">
														<Building2 className="size-3.5 text-stone-400 shrink-0" />
														<span className="text-stone-500 font-semibold">Restaurants:</span>
														{user.restaurant_names.split(", ").map((name, idx) => (
															<Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2 font-semibold">
																{name}
															</Badge>
														))}
													</span>
												)}
											</div>
										</div>
									</div>

									<div className="text-xs font-medium text-stone-400 sm:self-center shrink-0">
										Click to manage user
									</div>
								</div>
							))}

							{users.length === 0 && (
								<div className="text-center p-12 text-muted-foreground">
									<UserPlus className="mx-auto size-12 text-stone-355 mb-2" />
									<p className="font-semibold text-stone-850">No staff members yet</p>
									<p className="text-xs text-muted-foreground mt-0.5">Click Add User above to create your team.</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination Footer */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between border-t border-stone-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-xs">
					<div className="flex flex-1 justify-between sm:hidden">
						<Button
							variant="outline"
							onClick={() => setPage(Math.max(1, page - 1))}
							disabled={page === 1}
							className="h-10 text-xs font-semibold px-4 border-stone-200"
						>
							Previous
						</Button>
						<Button
							variant="outline"
							onClick={() => setPage(Math.min(totalPages, page + 1))}
							disabled={page === totalPages}
							className="h-10 text-xs font-semibold px-4 border-stone-200"
						>
							Next
						</Button>
					</div>
					<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-stone-500">
								Showing page <span className="font-semibold text-stone-800">{page}</span> of{" "}
								<span className="font-semibold text-stone-800">{totalPages}</span> (
								<span className="font-semibold text-stone-800">{totalCount}</span> total users)
							</p>
						</div>
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage(Math.max(1, page - 1))}
								disabled={page === 1}
								className="size-9 border-stone-200"
								title="Previous page"
							>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setPage(Math.min(totalPages, page + 1))}
								disabled={page === totalPages}
								className="size-9 border-stone-200"
								title="Next page"
							>
								<ChevronRight className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Details & Edit Overlay Modal */}
			{selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
					<div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
						{/* Header */}
						<div className="flex items-center justify-between border-b px-5 py-4 bg-stone-50">
							<div>
								<h3 className="font-bold text-stone-900 text-lg">Manage User Account</h3>
								<p className="text-xs text-stone-500 mt-0.5">{selectedUser.email}</p>
							</div>
							<button 
								onClick={() => setSelectedUser(null)}
								className="text-stone-400 hover:text-stone-600 rounded-lg p-1.5 hover:bg-stone-200/50 transition-colors"
							>
								<X className="size-5" />
							</button>
						</div>

						{/* Form Content */}
						<div className="overflow-y-auto p-5 flex-1 space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="grid gap-2">
									<label htmlFor="editName" className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Name
									</label>
									<Input 
										id="editName" 
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										required 
										className="min-h-11" 
									/>
								</div>

								<div className="grid gap-2">
									<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Email (Read Only)
									</label>
									<Input 
										value={selectedUser.email}
										disabled
										className="min-h-11 bg-stone-50 opacity-70 cursor-not-allowed" 
									/>
								</div>

								<div className="grid gap-2">
									<label htmlFor="editPassword" className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Change Password (Optional)
									</label>
									<Input 
										id="editPassword" 
										type="password"
										value={editPassword}
										onChange={(e) => setEditPassword(e.target.value)}
										className="min-h-11" 
										placeholder="Leave blank to keep current" 
									/>
								</div>

								<div className="grid gap-2">
									<label htmlFor="editRoleSelect" className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Role
									</label>
									<Select value={editRole} onValueChange={(val) => setEditRole(val || "editor")}>
										<SelectTrigger className="w-full h-11" id="editRoleSelect">
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent className="bg-white">
											<SelectItem value="owner">Owner</SelectItem>
											<SelectItem value="manager">Manager</SelectItem>
											<SelectItem value="editor">Editor (Write access)</SelectItem>
											<SelectItem value="viewer">Viewer (Read only)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{isSuperAdmin && (
								<div className="grid gap-2 pt-2">
									<label className="text-xs font-bold uppercase tracking-wider text-stone-500">
										Assigned Restaurants
									</label>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 border border-stone-200 bg-stone-50/50 rounded-lg p-3 max-h-40 overflow-y-auto">
										{restaurants.map((r) => {
											const checked = editRestaurants.includes(r.id);
											return (
												<label 
													key={r.id} 
													className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer select-none p-1 hover:bg-stone-200/40 rounded transition-colors"
												>
													<input 
														type="checkbox" 
														checked={checked}
														onChange={() => toggleEditRestaurant(r.id)}
														className="rounded text-primary focus:ring-primary size-4 accent-stone-700" 
													/>
													<span>{r.name}</span>
												</label>
											);
										})}
									</div>
								</div>
							)}

							{/* Status Management row */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
								<div>
									<h4 className="text-sm font-semibold text-stone-850">Account Status</h4>
									<p className="text-xs text-stone-500">Suspend access or unlock their account instantly.</p>
								</div>
								<Button
									variant="outline"
									onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
									className="h-10 text-xs font-semibold px-4 border-stone-200"
									disabled={isPending}
								>
									{selectedUser.status === "suspended" ? (
										<>
											<Unlock className="size-3.5 mr-1.5 text-green-600" />
											Activate Account
										</>
									) : (
										<>
											<Lock className="size-3.5 mr-1.5 text-amber-600" />
											Suspend Account
										</>
									)}
								</Button>
							</div>

							{/* Danger zone */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-100 bg-red-50/30 p-3 rounded-lg">
								<div>
									<h4 className="text-sm font-semibold text-red-850">Danger Zone</h4>
									<p className="text-xs text-red-600/80">Permanently delete user mappings across all organizations.</p>
								</div>
								<Button
									variant="ghost"
									onClick={() => handleDeleteUser(selectedUser.id, selectedUser.email)}
									className="h-10 text-xs font-semibold px-4 text-red-650 hover:text-red-750 hover:bg-red-50 border border-red-200"
									disabled={isPending}
								>
									<Trash2 className="size-3.5 mr-1.5" />
									Delete User
								</Button>
							</div>

							{editError && (
								<div className="flex items-center gap-2 text-sm font-semibold text-red-650 bg-red-50 border border-red-200 rounded-lg p-3">
									<AlertCircle className="size-4 shrink-0" />
									<span>{editError}</span>
								</div>
							)}
						</div>

						{/* Footer Actions */}
						<div className="flex justify-end gap-3 border-t px-5 py-4 bg-stone-50">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setSelectedUser(null)} 
								className="h-11 border-stone-200"
							>
								Cancel
							</Button>
							<Button 
								type="button" 
								disabled={isPending} 
								onClick={handleUpdateUser}
								className="h-11 px-6"
							>
								{isPending ? (
									<>
										<Loader2 className="size-4 animate-spin mr-2" />
										Saving…
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
