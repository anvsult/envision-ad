"use client";

import { useEffect } from "react";
import { useRouter } from "@/shared/lib/i18n/navigation";
import { usePermissions } from "@/app/providers";

export default function DashboardPage() {
    const router = useRouter();
    const { permissions, loading } = usePermissions();

    useEffect(() => {
        if (loading) return;

        if (permissions.includes("read:campaign")) {
            router.replace("/dashboard/advertiser/metrics");
            return;
        }

        if (permissions.includes("read:media")) {
            router.replace("/dashboard/media-owner/metrics");
            return;
        }

        router.replace("/dashboard/organization/overview");
    }, [loading, permissions, router]);

    return null;
}
