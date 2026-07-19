import { NextResponse } from "next/server";
import { deleteMedia } from "@/lib/server/menu-repository";

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	try {
		const success = await deleteMedia(id);
		if (!success) {
			return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Could not delete media." },
			{ status: 550 }
		);
	}
}
