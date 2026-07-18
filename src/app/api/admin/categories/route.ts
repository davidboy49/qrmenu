import {NextResponse} from "next/server";import {z} from "zod";import {createCategory,listCategories} from "@/lib/server/menu-repository";
const schema=z.object({nameEn:z.string().trim().min(2).max(80),nameKm:z.string().trim().min(2).max(80)});
export async function GET(){return NextResponse.json(await listCategories())}export async function POST(request:Request){const data=schema.safeParse(await request.json());if(!data.success)return NextResponse.json({error:"Enter both Khmer and English category names."},{status:400});return NextResponse.json(await createCategory(data.data),{status:201})}
