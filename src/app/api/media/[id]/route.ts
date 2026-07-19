import { getCloudflareEnv } from "@/lib/server/cloudflare";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { DB, BUCKET } = await getCloudflareEnv();

	const asset = await DB.prepare("SELECT r2_key, mime_type FROM media_assets WHERE id=? AND status='ready'")
		.bind(id)
		.first<{ r2_key: string; mime_type: string }>();

	if (!asset) {
		return new Response("Not found", { status: 404 });
	}

	const object = await BUCKET.get(asset.r2_key);
	if (!object) {
		return new Response("Not found", { status: 404 });
	}

	const data = await object.arrayBuffer();

	return new Response(data, {
		headers: {
			"content-type": asset.mime_type,
			"cache-control": "public, max-age=86400",
		},
	});
}
