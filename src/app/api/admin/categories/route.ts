import { NextResponse } from "next/server";
import { z } from "zod";
import { createCategory, listCategories, updateCategory } from "@/lib/server/menu-repository";

const schema = z.object({
	nameEn: z.string().trim().min(2).max(80),
	nameKm: z.string().trim().min(2).max(80),
	code: z.string().trim().max(10).optional(),
});

const updateSchema = z.object({
	nameEn: z.string().trim().min(2).max(80),
	nameKm: z.string().trim().min(2).max(80),
	code: z.string().trim().max(10).optional(),
	status: z.enum(["active", "inactive"]),
});

export async function GET() {
	return NextResponse.json(await listCategories());
}

export async function POST(request: Request) {
	const data = schema.safeParse(await request.json());
	if (!data.success) {
		return NextResponse.json({ error: "Enter both Khmer and English category names." }, { status: 400 });
	}
	return NextResponse.json(await createCategory(data.data), { status: 201 });
}

export async function PUT(request: Request) {
	const { searchParams } = new URL(request.url);
	const action = searchParams.get("action");

	if (action === "reorder") {
		try {
			const body = (await request.json()) as { ids?: string[] };
			if (!body.ids || !Array.isArray(body.ids)) {
				return NextResponse.json({ error: "Invalid category ids array." }, { status: 400 });
			}
			const { reorderCategories } = await import("@/lib/server/menu-repository");
			await reorderCategories(body.ids);
			return NextResponse.json({ success: true });
		} catch (err) {
			console.error("Reorder failed", err);
			return NextResponse.json({ error: "Could not save custom ordering." }, { status: 500 });
		}
	}

	const id = searchParams.get("id");
	if (!id) {
		return NextResponse.json({ error: "Missing category ID." }, { status: 400 });
	}
	const data = updateSchema.safeParse(await request.json());
	if (!data.success) {
		return NextResponse.json({ error: "Invalid category fields." }, { status: 400 });
	}
	return NextResponse.json(await updateCategory(id, data.data));
}
