import { redirect } from "next/navigation";
import { getSession, getActiveContextDetails } from "../actions";
import QRGeneratorClient from "@/components/admin/qr-generator-client";

export const dynamic = "force-dynamic";

export default async function QRCodesPage() {
	const session = await getSession();
	if (!session) {
		redirect("/login");
	}

	const activeContext = await getActiveContextDetails();

	return <QRGeneratorClient activeContext={activeContext} />;
}
