"use client";

import { Card, Text, Group, Avatar, Stack, Badge, ThemeIcon, Title, Box, Divider, Paper, ActionIcon } from "@mantine/core";
import { IconUser, IconBuildingStore, IconMail, IconMapPin, IconBriefcase, IconPencil, IconPhone } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface ProfileContentProps {
    user: any;
    business: any;
}

export default function ProfileContent({ user, business }: ProfileContentProps) {
    const t = useTranslations("profilePage");

    // Helper to handle potential boolean field naming differences safely
    const roles = business?.roles || {};
    const isMediaOwner = roles.mediaOwner === true || (roles as any).isMediaOwner === true;
    const isAdvertiser = roles.advertiser === true || (roles as any).isAdvertiser === true;

    // Helper helper to ensure strings
    const safeStr = (val: any, fallback = "") => typeof val === 'string' ? val : diffType(val, fallback);
    const diffType = (val: any, fallback: string) => val ? String(val) : fallback;

    const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <Group justify="space-between" align="center" py="xs">
            <Stack gap={2}>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">{label}</Text>
                <Text size="sm" fw={500} component="div">{value}</Text>
            </Stack>
        </Group>
    );

    return (
        <Stack gap="lg">
            <Paper radius="md" withBorder shadow="sm" pos="relative" style={{ overflow: "hidden" }}>
                {/* Banner Section */}
                <Box h={140} bg="var(--mantine-color-blue-filled)" style={{ width: '100%' }} />

                <Stack px="xl" pb="xl">
                    {/* Header with Avatar and Main Info - Overlapping Banner */}
                    <Group justify="space-between" align="flex-end" mt="-40px" mb="md">
                        <Group align="flex-end">
                            <Avatar
                                src={user.picture}
                                alt={safeStr(user.name, "User")}
                                size={120}
                                radius="100%"
                                style={{ border: '6px solid var(--mantine-color-body)' }}
                            />
                            <Box pb="xs">
                                <Title order={2}>{safeStr(user.name)}</Title>
                                <Text c="dimmed" size="sm"> EnvisionAd Member</Text>
                            </Box>
                        </Group>
                    </Group>

                    {/* Main Content Sections */}
                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                        {/* Personal Information Section */}
                        <Box>
                            <Title order={4} mb="xs" size="h5" tt="uppercase" c="dimmed">{t("personalInfo.title")}</Title>
                            <Stack gap="xs">
                                <InfoRow
                                    label="USERNAME"
                                    value={safeStr(user.nickname || user.name)}
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label="EMAIL"
                                    value={
                                        <Group gap="xs">
                                            {safeStr(user.email)}
                                            {user.email_verified && <Badge size="xs" color="green" variant="light">Verified</Badge>}
                                        </Group>
                                    }
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label={t("personalInfo.firstName").toUpperCase()}
                                    value={safeStr(user.given_name, "-")}
                                />
                                <Divider variant="dashed" />
                                <InfoRow
                                    label={t("personalInfo.lastName").toUpperCase()}
                                    value={safeStr(user.family_name, "-")}
                                />
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Paper>

            {/* Related Business Section */}
            <Paper radius="md" withBorder shadow="sm" p="xl">
                <Title order={3} mb="md">Related Business</Title>
                <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
                    {business ? (
                        <Stack gap="xs">
                            <InfoRow
                                label={t("businessInfo.companyName").toUpperCase()}
                                value={
                                    <Group gap="sm">
                                        <ThemeIcon variant="light" color="grape"><IconBuildingStore size={16} /></ThemeIcon>
                                        {safeStr(business.name)}
                                    </Group>
                                }
                            />
                            <Divider />
                            <InfoRow
                                label={t("businessInfo.address").toUpperCase()}
                                value={
                                    <Group gap="xs" align="center">
                                        <IconMapPin size={16} style={{ opacity: 0.7 }} />
                                        <span>
                                            {safeStr(business.address?.street)}, {safeStr(business.address?.city)}, {safeStr(business.address?.state)}
                                        </span>
                                    </Group>
                                }
                            />
                            <Divider />
                            <InfoRow
                                label={t("businessInfo.role").toUpperCase()}
                                value={
                                    <Group gap="xs">
                                        {isMediaOwner && <Badge color="cyan">Media Owner</Badge>}
                                        {isAdvertiser && <Badge color="orange">Advertiser</Badge>}
                                    </Group>
                                }
                            />
                        </Stack>
                    ) : (
                        <Stack align="center" justify="center" h={100} py="lg">
                            <IconBriefcase size={40} color="gray" style={{ opacity: 0.5 }} />
                            <Text c="dimmed">{t("businessInfo.noBusiness")}</Text>
                        </Stack>
                    )}
                </Paper>
            </Paper>
        </Stack>
    );
}
