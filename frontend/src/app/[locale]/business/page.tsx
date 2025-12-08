import { BusinessPageWrapper } from "../../../components/Dashboard/Business/BusinessPageWrapper";

export default async function BusinessPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    // Await params to satisfy Next.js 15 requirements, even if unused directly (passed via context usually)
    const { locale } = await params;

    return <BusinessPageWrapper />;
}
