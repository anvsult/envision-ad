import {Button, Card, Group, Stack, Text, Title} from "@mantine/core";
import {useTranslations} from "next-intl";
import {BusinessResponse} from "@/types/BusinessTypes";
import {IconEdit} from "@tabler/icons-react";
import {useUser} from "@auth0/nextjs-auth0/client";

interface BusinessDetailProps {
    business: BusinessResponse;
    onEdit?: (id: string | number) => void;
}

export function BusinessDetail({business, onEdit}: BusinessDetailProps) {
    const t = useTranslations("business");
    const {user, isLoading} = useUser();

    if (!business) return <Text>No business data found</Text>;

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={3}>{business.name}</Title>
                    <Group gap="xs">
                        {onEdit && user?.sub === business.owner && (
                            <Button
                                leftSection={<IconEdit size={16}/>}
                                variant="light"
                                color="blue"
                                size="xs"
                                onClick={() => onEdit(business.businessId)}
                            >
                                {t("table.edit")}
                            </Button>
                        )}
                    </Group>
                </Group>

                <Stack gap={4}>
                    <Text>
                        <strong>{t("table.companySize")}: </strong>
                        {t(`sizes.${business.companySize}`)}
                    </Text>
                    <Text>
                        <strong>{t("table.address")}: </strong>
                        {business.address
                            ? `${business.address.street}, ${business.address.city}, ${business.address.state}`
                            : "-"}
                    </Text>
                    <Text>
                        <strong>{t("table.dateCreated")}: </strong>
                        {business.dateCreated
                            ? new Date(business.dateCreated).toLocaleDateString()
                            : "-"}
                    </Text>
                    <Text>
                        <strong>{t("table.roles")}: </strong>
                        {business.roles ? (
                            <>
                                {business.roles.mediaOwner && t("roles.mediaOwner")}
                                {business.roles.mediaOwner && business.roles.advertiser && ", "}
                                {business.roles.advertiser && t("roles.advertiser")}

                                {!business.roles.mediaOwner && !business.roles.advertiser && "-"}
                            </>
                        ) : (
                            "-"
                        )}
                    </Text>
                </Stack>
            </Stack>
        </Card>
    );
}
