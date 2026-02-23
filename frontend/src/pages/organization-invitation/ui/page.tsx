'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef, useState } from "react";
import { Button, Loader, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { addEmployeeToOrganization, getOrganizationById } from "@/features/organization-management/api";
import { AUTH0_ROLES } from "@/shared/lib/auth/roles";
import { usePermissions } from "@/app/providers";
import { Link } from "@/shared/lib/i18n/navigation";

export default function OrganizationInvitationPage() {
    const t = useTranslations('invitation');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { refreshPermissions } = usePermissions();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const token = searchParams?.get("token");
    const organizationId = searchParams?.get("businessId");
    const invitationProcessed = useRef(false);

    useEffect(() => {
        if (!searchParams || invitationProcessed.current) return;
        if (!token || !organizationId) return;

        const acceptInvitation = async () => {
            invitationProcessed.current = true;
            try {
                await addEmployeeToOrganization(organizationId, token);
                const organization = await getOrganizationById(organizationId);

                await fetch(`/api/auth0/update-user-roles/${encodeURIComponent(user!.sub)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roles: [
                            ...(organization.roles.advertiser ? [AUTH0_ROLES.ADVERTISER] : []),
                            ...(organization.roles.mediaOwner ? [AUTH0_ROLES.MEDIA_OWNER] : []),
                        ],
                    }),
                });

                await refreshPermissions();
                setStatus("success");
                setMessage(t('success.message'));
                setTimeout(() => router.push("/dashboard/organization/overview"), 2000);
            } catch {
                setStatus("error");
                setMessage(t('error.message'));
            }
        };

        if (!isLoading && !user) {
            const returnUrl = `/invite?businessId=${encodeURIComponent(organizationId)}&token=${encodeURIComponent(token)}`;
            router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
            return;
        }

        if (user) {
            void acceptInvitation();
        }
    }, [user, isLoading, token, organizationId, router, searchParams, refreshPermissions, t]);

    if (searchParams && (!token || !organizationId)) {
        return (
            <Stack align="center" justify="center" gap="md" style={{ minHeight: "calc(100vh - 340px)" }}>
                <IconX size={48} color="red" />
                <Title order={1} ta="center" size="h2">{t('invalidLink.title')}</Title>
                <Text ta="center">{t('invalidLink.description')}</Text>
                <Button size="sm" component={Link} href="/">{t('back')}</Button>
            </Stack>
        );
    }

    if (!searchParams || isLoading || status === "loading") {
        return (
            <Stack align="center" justify="center" gap="md" style={{ minHeight: "calc(100vh - 340px)" }}>
                <Loader size="xl" />
                <Text>{t('loading')}</Text>
            </Stack>
        );
    }

    return (
        <Stack align="center" justify="center" gap="md" style={{ minHeight: "calc(100vh - 340px)" }}>
            {status === "success" ? (
                <>
                    <IconCheck size={48} color="green" />
                    <Title order={1} ta="center" size="h2">{t('success.title')}</Title>
                    <Text ta="center">{message}</Text>
                    <Text size="sm" c="dimmed">{t('success.redirecting')}</Text>
                </>
            ) : (
                <>
                    <IconX size={48} color="red" />
                    <Title order={1} ta="center" size="h2">{t('error.title')}</Title>
                    <Text ta="center">{message}</Text>
                    <Button size="sm" component={Link} href="/">{t('back')}</Button>
                </>
            )}
        </Stack>
    );
}