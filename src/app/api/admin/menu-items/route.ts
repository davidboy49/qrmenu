import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/server/auth";
import { z } from "zod";
import { createMenuItem, listAdminMenuItems } from "@/lib/server/menu-repository";

const schema = z.object({
	nameEn: z.string().trim().min(2).max(120),
	nameKm: z.string().trim().min(2).max(120),
	priceKhr: z.coerce.number().int().min(0).max(10_000_000),
	priceUsd: z.coerce.number().min(0).max(100_000),
	imageId: z.string().trim().nullable().optional(),
	categoryId: z.string().trim().nullable().optional(),
	descriptionEn: z.string().optional().or(z.literal("")),
	descriptionKm: z.string().optional().or(z.literal("")),
});
export async function GET(){
	const auth = await requireApiSession();
	if (auth.error) return auth.error;
return NextResponse.json(await listAdminMenuItems())}
export async function POST(request:Request){
	const auth = await requireApiSession(request);
	if (auth.error) return auth.error;
const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Please complete the required fields."},{status:400});return NextResponse.json(await createMenuItem(parsed.data),{status:201})}
