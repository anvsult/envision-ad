"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button, Center, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import {addEmployeeToBusiness} from "@/services/BusinessService";

export default function AcceptInvitePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useUser();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    const token = searchParams.get("token");
    const businessId = searchParams.get("businessId");

    useEffect(() => {
        const acceptInvitation = async () => {
            try {
                await addEmployeeToBusiness(businessId!, token!)

                setStatus("success");
                setMessage("You've successfully joined the business!");

                setTimeout(() => {
                    router.push("/dashboard/business/employees");
                }, 2000);

            } catch (error) {
                setStatus("error");
                setMessage("An error occurred while accepting the invitation.");
            }
        };

        if (!isLoading && !user) {
            const returnUrl = `/invite?businessId=${businessId}&token=${token}`;
            router.push(`/auth/login?returnTo=${encodeURIComponent(returnUrl)}`);
            return;
        }

        if (user && token && businessId) {
            acceptInvitation();
        }
    }, [user, isLoading, token, businessId, router]);

    if (!token || !businessId) {
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