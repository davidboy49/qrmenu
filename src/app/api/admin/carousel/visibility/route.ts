import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/server/auth";
import { getCarouselVisibility, getRestaurantContextId, setCarouselVisibility } from "@/lib/server/menu-repository";

const schema = z.object({ enabled: z.boolean() });

export async function GET() {
	const auth = await requireApiSession();
	if (auth.error) return auth.error;

	try {
		const restaurantId = await getRestaurantContextId();
		return NextResponse.json({ enabled: await getCarouselVisibility(restaurantId) });
	} catch (err) {
		console.error("Failed to read carousel visibility", err);
		return NextResponse.json({ error: "Could not load carousel setting" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	const auth = await requireApiSession(request);
	if (auth.error) return auth.error;

	const parsed = schema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return NextResponse.json({ error: "Invalid carousel setting" }, { status: 400 });

	try {
		const restaurantId = await getRestaurantContextId();
		await setCarouselVisibility(restaurantId, parsed.data.enabled);
		return NextResponse.json({ enabled: parsed.data.enabled });
	} catch (err) {
		console.error("Failed to update carousel visibility", err);
		return NextResponse.json({ error: "Could not update carousel setting" }, { status: 500 });
	}
}
