import { NextResponse } from "next/server";
import { z } from "zod";
import { createCategory, listCategories, updateCategory } from "@/lib/server/menu-repository";

const schema = z.object({
	nameEn: z.string().trim().min(2).max(80),
	nameKm: z.string().trim().min(2).max(80),
});

const updateSchema = z.object({
	nameEn: z.string().trim().min(2).max(80),
	nameKm: z.string().trim().min(2).max(80),
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
