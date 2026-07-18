import { NextResponse } from "next/server";
import { z } from "zod";
import { getMenuItem, updateMenuItem } from "@/lib/server/menu-repository";

const schema=z.object({nameEn:z.string().trim().min(2).max(120),nameKm:z.string().trim().min(2).max(120),priceKhr:z.coerce.number().int().min(0),priceUsd:z.coerce.number().min(0),status:z.enum(["active","inactive"]),imageId:z.string().uuid().nullable().optional()});
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const item=await getMenuItem((await params).id);return item?NextResponse.json(item):NextResponse.json({error:"Not found"},{status:404})}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const data=schema.safeParse(await request.json());if(!data.success)return NextResponse.json({error:"Invalid menu item."},{status:400});const item=await updateMenuItem((await params).id,data.data);return item?NextResponse.json(item):NextResponse.json({error:"Not found"},{status:404})}
