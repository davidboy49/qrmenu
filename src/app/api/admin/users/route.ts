import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/app/admin/actions";
import {
	createStaffUserWithPassword,
	listStaffUsers,
	listAllStaffUsers,
	deleteStaffUser,
	updateStaffUserStatus,
	getRestaurantContextId,
} from "@/lib/server/menu-repository";

const createSchema = z.object({
	email: z.string().max(254).optional().or(z.literal("")),
	displayName: z.string().trim().min(2).max(100),
	role: z.enum(["owner", "manager", "editor", "viewer"]),
	restaurantId: z.string().optional(),
	password: z.string().min(4).max(50).optional(),
});

export async function GET(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
	const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
	const offset = (page - 1) * limit;

	if (session.role === "admin") {
		const { users, totalCount } = await listAllStaffUsers(limit, offset);
		return NextResponse.json({
			users,
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
			currentPage: page,
		});
	} else {
		const { users, totalCount } = await listStaffUsers(limit, offset);
		return NextResponse.json({
			users,
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
			currentPage: page,
		});
	}
}

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const data = createSchema.safeParse(body);
		if (!data.success) {
			return NextResponse.json({ error: "Invalid form input." }, { status: 400 });
		}

		// Determine restaurant ID
		let restaurantId = data.data.restaurantId;
		if (!restaurantId) {
			if (session.role === "admin") {
				return NextResponse.json({ error: "Please select a restaurant." }, { status: 400 });
			}
			restaurantId = await getRestaurantContextId();
		}

		let emailVal = data.data.email?.trim() || "";
		if (!emailVal) {
			const base = data.data.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
			emailVal = base || `user.${Math.floor(Math.random() * 10000)}`;
		}

		const result = await createStaffUserWithPassword({
			email: emailVal,
			displayName: data.data.displayName,
			role: data.data.role,
			restaurantIds: [restaurantId],
			password: data.data.password,
		});

		return NextResponse.json(result, { status: 201 });
	} catch (e: any) {
		return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
	}
}

export async function DELETE(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	if (!id) {
		return NextResponse.json({ error: "Missing ID" }, { status: 400 });
	}

	try {
		await deleteStaffUser(id);
		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { id, status } = (await request.json()) as { id: string; status: string };
		if (!id || !status) {
			return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
		}

		await updateStaffUserStatus(id, status);
		return NextResponse.json({ success: true });
	} catch (e) {
		return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
	}
}
