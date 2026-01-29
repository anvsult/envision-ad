"use client";

import {useEffect, useRef, useState} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Center, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import {addEmployeeToOrganization, getOrganizationById} from "@/features/organization-management/api";
import {AUTH0_ROLES} from "@/shared/lib/auth/roles";
import {usePermissions} from "@/app/providers";

export default function OrganizationInvitationPage() {
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
        if (!searchParams || invitationProcessed.current) {
            return;
        }

        const acceptInvitation = async () => {
            invitationProcessed.current = true;
            try {
                await addEmployeeToOrganization(organizationId!, token!)

                const organization = await getOrganizationById(organizationId!);

                await fetch(`/api/auth0/update-user-roles/${encodeURIComponent(user!.sub)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({roles: [
                            ...(organization.roles.advertiser ? [AUTH0_ROLES.ADVERTISER] : []),
                            ...(organization.roles.mediaOwner ? [AUTH0_ROLES.MEDIA_OWNER] : [])
                        ]})
                });

                await refreshPermissions();

                setStatus("success");
                setMessage("You've successfully joined the organization!");

                setTimeout(() => {
                    router.push("/dashboard/organization/overview");
                }, 2000);

            } catch {
                setStatus("error");
                setMessage("An error occurred while accepting the invitation.");
            }
        };

        if (!isLoading && !user) {
            const returnUrl = `/invite?businessId=${encodeURIComponent(organizationId!)}&token=${encodeURIComponent(token!)}`;
            router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
            return;
        }

        if (user && token && organizationId) {
            acceptInvitation();
        }
    }, [user, isLoading, token, organizationId, router, searchParams, refreshPermissions]);

    // Show loading while searchParams is being initialized
    if (!searchParams) {
        return (
            <Center style={{ minHeight: "100vh" }}>
                <Stack align="center">
                    <Loader size="xl" />
                    <Text>Loading...</Text>
                </Stack>
            </Center>
        );
    }

    if (!token || !organizationId) {
        return (
            <Center style={{ minHeight: "100vh" }}>
                <Paper shadow="md" p="xl" withBorder>
                    <Stack align="center">
                        <IconX size={48} color="red" />
                        <Title order={3}>Invalid Invitation Link</Title>
                        <Text c="dimmed">This invitation link is invalid or incomplete.</Text>
                        <Button onClick={() => router.push("/")}>Go Home</Button>
                    </Stack>
                </Paper>
            </Center>
        );
    }

    if (isLoading || status === "loading") {
        return (
            <Center style={{ minHeight: "100vh" }}>
                <Stack align="center">
                    <Loader size="xl" />
                    <Text>Processing your invitation...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Center style={{ minHeight: "100vh" }}>
            <Paper shadow="md" p="xl" withBorder>
                <Stack align="center">
                    {status === "success" ? (
                        <>
                            <IconCheck size={48} color="green" />
                            <Title order={3}>Success!</Title>
                            <Text c="dimmed">{message}</Text>
                            <Text size="sm">Redirecting to dashboard...</Text>
                        </>
                    ) : (
                        <>
                            <IconX size={48} color="red" />
                            <Title order={3}>Failed</Title>
                            <Text c="dimmed">{message}</Text>
                            <Button onClick={() => router.push("/")}>Go Home</Button>
                        </>
                    )}
                </Stack>
            </Paper>
        </Center>
    );
}