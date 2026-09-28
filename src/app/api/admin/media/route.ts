import {NextResponse} from 'next/server';import {listMedia,saveMedia} from '@/lib/server/menu-repository';
import { requireApiSession } from "@/lib/server/auth";
export async function GET(){
	const auth = await requireApiSession();
	if (auth.error) return auth.error;
return NextResponse.json(await listMedia())}export async function POST(request:Request){
	const auth = await requireApiSession(request);
	if (auth.error) return auth.error;
const data=await request.formData();const file=data.get('file');if(!(file instanceof File))return NextResponse.json({error:'Choose an image file.'},{status:400});try{return NextResponse.json(await saveMedia(file),{status:201})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not upload image.'},{status:400})}}
