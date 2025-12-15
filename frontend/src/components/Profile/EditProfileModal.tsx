import { Modal, TextInput, Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { updateUser } from "@/services/UserService";
import { useRouter } from "next/navigation";

interface EditProfileModalProps {
    opened: boolean;
    onClose: () => void;
    user: any;
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
        });
    }, [user]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // Also update the full name to keep it consistent
            const name = `${values.given_name} ${values.family_name}`.trim();
            const updateData = { ...values, name: name || values.nickname };

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
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>{t("cancel")}</Button>
                        <Button type="submit">{t("save")}</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
