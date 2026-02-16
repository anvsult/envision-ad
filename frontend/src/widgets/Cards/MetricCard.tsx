import { Card, Group, Stack, Text, Title } from "@mantine/core";

type MetricCardProps = {
    label: string;
    value: string;
    description?: string;
    icon?: React.ReactNode;
};

export function MetricCard({ label, value, description, icon }: MetricCardProps) {
    return (
        <Card withBorder radius="md" p="md">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={6} style={{ minWidth: 0 }}>
                    <Text c="dimmed" size="sm">
                        {label}
                    </Text>

                    <Title order={3} style={{ lineHeight: 1.1 }}>
                        {value}
                    </Title>

                    {description ? (
                        <Text c="dimmed" size="xs">
                            {description}
                        </Text>
                    ) : null}
                </Stack>

                {icon ? (
                    <Card
                        radius="md"
                        p="xs"
                        style={{
                            background: "var(--mantine-color-blue-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Card>
                ) : null}
            </Group>
        </Card>
    );
}
