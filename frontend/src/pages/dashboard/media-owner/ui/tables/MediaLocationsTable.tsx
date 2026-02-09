import React from "react";
import { Accordion, ActionIcon, Button, Group, Table, Text, Box, Flex } from "@mantine/core";
import { IconTrash, IconPlus, IconMapPin } from "@tabler/icons-react";
import { MediaLocation } from "@/entities/media-location/model/mediaLocation";
import { useTranslations } from "next-intl";

interface MediaLocationsTableProps {
    locations: MediaLocation[];
    onDeleteLocation: (id: string) => void;
    onAssignMedia: (locationId: string) => void;
    onEditLocation: (location: MediaLocation) => void;
    onUnassignMedia: (locationId: string, mediaId: string) => void;
}

export function MediaLocationsTable({ locations, onDeleteLocation, onAssignMedia, onEditLocation, onUnassignMedia }: MediaLocationsTableProps) {
    const t = useTranslations("mediaLocations.table");

    if (locations.length === 0) {
        return (
            <Box p="xl">
                <Text ta="center" c="dimmed" size="lg" fw={500}>
                    {t('noLocations')}
                </Text>
            </Box>
        );
    }

    return (
        <Accordion variant="separated" multiple>
            {locations.map((location) => (
                <Accordion.Item key={location.id} value={location.id}>
                    <Flex align="center" justify="space-between" pr="md">
                        <Box style={{ flex: 1 }}>
                            <Accordion.Control>
                                <Group>
                                    <IconMapPin size={20} />
                                    <Text fw={500}>{location.name}</Text>
                                    <Text size="sm" c="dimmed">{location.city}, {location.province}</Text>
                                </Group>
                            </Accordion.Control>
                        </Box>

                        <Group gap="xs" ml="md">
                            <Button
                                size="xs"
                                variant="light"
                                leftSection={<IconPlus size={14} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAssignMedia(location.id);
                                }}
                            >
                                {t('assignMedia')}
                            </Button>
                            <Button
                                size="xs"
                                variant="subtle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditLocation(location);
                                }}
                            >
                                <Text size="sm">{t('edit')}</Text>
                            </Button>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteLocation(location.id);
                                }}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    </Flex>

                    <Accordion.Panel>

                        <Text size="sm" c="dimmed">{location.street}, {location.postalCode}, {location.country}</Text>

                        <Text size="sm" mt="md" fw={500}>{t('assignedMedia')}:</Text>
                        {location.mediaList && location.mediaList.length > 0 ? (
                            <Box mt="xs">
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>{t('mediaTitle')}</Table.Th>
                                            <Table.Th>{t('mediaType')}</Table.Th>
                                            <Table.Th style={{ width: 50 }} />
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {location.mediaList.map((media) => (
                                            <Table.Tr key={media.id}>
                                                <Table.Td>{media.title}</Table.Td>
                                                <Table.Td>{media.typeOfDisplay}</Table.Td>
                                                <Table.Td>
                                                    {media.id && (
                                                        <ActionIcon
                                                            color="red"
                                                            variant="subtle"
                                                            onClick={() => media.id && onUnassignMedia(location.id, media.id)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        ) : (
                            <Text size="sm" c="dimmed" fs="italic">{t('noAssignedMedia')}</Text>
                        )}
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}
