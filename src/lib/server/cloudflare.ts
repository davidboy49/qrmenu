import { getCloudflareContext } from "@opennextjs/cloudflare";

export type QRMenuCloudflareEnv = CloudflareEnv & {
	DB: D1Database;
	BUCKET: R2Bucket;
};

export async function getCloudflareEnv(): Promise<QRMenuCloudflareEnv> {
	return (await getCloudflareContext({ async: true })).env as QRMenuCloudflareEnv;
}
