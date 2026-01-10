import { Modal, TextInput, Button, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { updateUser } from "@/features/auth";
import { Employee } from "@/entities/organization";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface EditProfileModalProps {
    opened: boolean;
    onClose: () => void;
    user: Employee;
}

export function EditProfileModal({ opened, onClose, user }: EditProfileModalProps) {
    const t = useTranslations("profilePage.editModal");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            given_name: user.given_name || "",
            family_name: user.family_name || "",
            nickname: user.nickname || user.name || "",
            bio: user.user_metadata?.bio || "",
        },
        validate: {
            nickname: (value) => (value.trim().length < 1 ? t("required") : null),
            given_name: (value) => (value.trim().length < 1 ? t("required") : null),
            family_name: (value) => (value.trim().length < 1 ? t("required") : null),
        },
    });

    // Track previous open state to detect when modal opens
    const [prevOpened, setPrevOpened] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        // Only run when opened changes from false to true
        if (opened && !prevOpened) {
            form.setValues({
                given_name: user.given_name || "",
                family_name: user.family_name || "",
                nickname: user.nickname || user.name || "",
                bio: user.user_metadata?.bio || "",
            });
        }
        setPrevOpened(opened);
    }, [opened, user, prevOpened]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // Trim values to avoid whitespace issues
            const trimmedGivenName = values.given_name.trim();
            const trimmedFamilyName = values.family_name.trim();
            const trimmedNickname = values.nickname.trim();
            const trimmedBio = values.bio.trim();

            // Also update the full name to keep it consistent
            const name = `${trimmedGivenName} ${trimmedFamilyName}`.trim();
            const updateData = {
                given_name: trimmedGivenName,
                family_name: trimmedFamilyName,
                nickname: trimmedNickname,
                name: name || trimmedNickname,
                user_metadata: {
                    bio: trimmedBio
                }
            };

            await updateUser(user.sub || user.user_id, updateData);
            notifications.show({
                title: t("successTitle"),
                message: t("successMessage"),
                color: "green",
            });
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
            notifications.show({
                title: "Error",
                message: t("error") || "Failed to update profile",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={t("title")} size="xl">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label={t("username")}
                        placeholder={t("usernamePlaceholder")}
                        {...form.getInputProps("nickname")}
                    />
                    <TextInput
                        label={t("firstName")}
                        placeholder={t("firstNamePlaceholder")}
                        {...form.getInputProps("given_name")}
                    />
                    <TextInput
                        label={t("lastName")}
                        placeholder={t("lastNamePlaceholder")}
                        {...form.getInputProps("family_name")}
                    />
                    <Textarea
                        label={t("bio")}
                        placeholder={t("bioPlaceholder")}
                        minRows={3}
                        autosize
                        {...form.getInputProps("bio")}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>{t("cancel")}</Button>
                        <Button type="submit" loading={loading}>{t("save")}</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
