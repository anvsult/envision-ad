import { Modal, TextInput, Button, Group, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { updateUser } from "@/services/UserService";
import { useRouter } from "next/navigation";

interface User {
    sub: string;
    given_name?: string;
    family_name?: string;
    nickname?: string;
    name?: string;
    user_metadata?: {
        bio?: string;
    };
}

interface EditProfileModalProps {
    opened: boolean;
    onClose: () => void;
    user: User;
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

    // Reset form when user changes
    useEffect(() => {
        form.setValues({
            given_name: user.given_name || "",
            family_name: user.family_name || "",
            nickname: user.nickname || user.name || "",
            bio: user.user_metadata?.bio || "",
        });
    }, [user, form]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // Also update the full name to keep it consistent
            const name = `${values.given_name} ${values.family_name}`.trim();
            const updateData = {
                given_name: values.given_name,
                family_name: values.family_name,
                nickname: values.nickname,
                name: name || values.nickname,
                user_metadata: {
                    bio: values.bio
                }
            };

            await updateUser(user.sub, updateData);
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title={t("title")}>
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
