"use client";

import { Button, Stack, TextInput, Title, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { updateAppSetting } from "@/features/app-settings/api";
import axiosInstance from "@/shared/api/axios/axios";

export default function AppSettingsPage() {
    const t = useTranslations("admin.settingsPage");

    const [bookMeetingUrl, setBookMeetingUrl] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get("/settings/book-meeting-url")
            .then((res) => setBookMeetingUrl(res.data.value ?? ""))
            .catch(() => {
                // not set yet — leave empty
            });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateAppSetting("book-meeting-url", bookMeetingUrl);
            notifications.show({ title: t("notifications.saved"), message: "", color: "green" });
        } catch {
            notifications.show({ title: t("notifications.saveFailed"), message: "", color: "red" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack component="main" gap="md" p="md" style={{ flex: 1, minWidth: 0, maxWidth: 600 }}>
            <Title order={1}>{t("title")}</Title>

            <Stack gap="xs">
                <TextInput
                    label={t("bookMeetingUrlLabel")}
                    value={bookMeetingUrl}
                    onChange={(e) => setBookMeetingUrl(e.currentTarget.value)}
                    placeholder="https://calendly.com/..."
                />
                <Text size="xs" c="dimmed">{t("bookMeetingUrlDescription")}</Text>
            </Stack>

            <Button onClick={handleSave} loading={loading} style={{ alignSelf: "flex-start" }}>
                {t("save")}
            </Button>
        </Stack>
    );
}
