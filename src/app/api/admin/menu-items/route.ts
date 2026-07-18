import { NextResponse } from "next/server";
import { z } from "zod";
import { createMenuItem, listAdminMenuItems } from "@/lib/server/menu-repository";
export const runtime = "edge";
const schema=z.object({nameEn:z.string().trim().min(2).max(120),nameKm:z.string().trim().min(2).max(120),priceKhr:z.coerce.number().int().min(0).max(10_000_000),priceUsd:z.coerce.number().min(0).max(100_000)});
export async function GET(){return NextResponse.json(await listAdminMenuItems())}
export async function POST(request:Request){const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Please complete the required fields."},{status:400});return NextResponse.json(await createMenuItem(parsed.data),{status:201})}
