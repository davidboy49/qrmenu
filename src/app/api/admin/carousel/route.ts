import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/server/auth";
import { getRestaurantContextId, listRestaurantCarousel, toggleCarouselMedia } from "@/lib/server/menu-repository";

export async function GET() {
	const auth = await requireApiSession();
	if (auth.error) return auth.error;

	try {
		const restaurantId = await getRestaurantContextId();
		const carousel = await listRestaurantCarousel(restaurantId);
		return NextResponse.json(carousel);
	} catch (err) {
		console.error("Failed to list carousel", err);
		return NextResponse.json({ error: "Could not load carousel configuration" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const auth = await requireApiSession(request);
	if (auth.error) return auth.error;

	try {
		const restaurantId = await getRestaurantContextId();
		const { mediaId, active } = await request.json() as { mediaId: string; active: boolean };
		if (!mediaId) {
			return NextResponse.json({ error: "Missing media ID" }, { status: 400 });
		}
		await toggleCarouselMedia(restaurantId, mediaId, active);
		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Failed to toggle carousel media", err);
		return NextResponse.json({ error: "Could not update carousel configuration" }, { status: 500 });
	}
}
