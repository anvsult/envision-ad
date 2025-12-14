import React from "react";
import { Accordion, ActionIcon, Button, Group, ScrollArea, Table, Text, Badge, Image, Box } from "@mantine/core";
import { IconTrash, IconPlus, IconPhoto, IconMovie } from "@tabler/icons-react";
import { AdCampaign } from "@/types/AdTypes";

interface AdCampaignsTableProps {
    campaigns: AdCampaign[];
    onDeleteAd: (campaignId: string, adId: string) => void;
    onOpenAddAd: (campaignId: string) => void;
}

export function AdCampaignsTable({ campaigns, onDeleteAd, onOpenAddAd }: AdCampaignsTableProps) {

    const getIcon = (type: string) => type === "VIDEO" ? <IconMovie size={16} /> : <IconPhoto size={16} />;

    return (
        <Accordion variant="separated" multiple>
            {campaigns.map((campaign) => (
                <Accordion.Item key={campaign.campaignId} value={campaign.campaignId}>
                    <Accordion.Control>
                        <Group justify="space-between" pr="md">
                            <Text fw={500}>{campaign.name}</Text>
                            <Button
                                component="span"
                                size="xs"
                                variant="light"
                                leftSection={<IconPlus size={14} />}
                                onClick={(e) => { e.stopPropagation(); onOpenAddAd(campaign.campaignId); }}
                            >
                                Add Ad
                            </Button>
                        </Group>
                    </Accordion.Control>

                    <Accordion.Panel>
                        <ScrollArea>
                            {/* increased verticalSpacing ensures rows accommodate the taller images */}
                            <Table striped highlightOnHover verticalSpacing="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Preview</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Duration</Table.Th>
                                        <Table.Th style={{textAlign: "right"}}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {campaign.ads.map((ad) => (
                                        <Table.Tr key={ad.adId}>
                                            {/* --- PREVIEW COLUMN --- */}
                                            <Table.Td width={150}>
                                                <Box
                                                    w={120}
                                                    h={68}
                                                    style={{
                                                        overflow: 'hidden',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--mantine-color-gray-3)',
                                                        backgroundColor: 'var(--mantine-color-gray-1)'
                                                    }}
                                                >
                                                    {ad.adType === 'VIDEO' ? (
                                                        <video
                                                            src={ad.adUrl}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            muted
                                                            playsInline
                                                            // Optional: onMouseOver={(e) => e.currentTarget.play()}
                                                            // Optional: onMouseOut={(e) => e.currentTarget.pause()}
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={ad.adUrl}
                                                            w="100%"
                                                            h="100%"
                                                            fit="cover"
                                                            alt={ad.name}
                                                            fallbackSrc="https://placehold.co/120x68?text=No+Image"
                                                        />
                                                    )}
                                                </Box>
                                            </Table.Td>

                                            <Table.Td style={{ verticalAlign: 'middle' }}>
                                                <Text fw={500} size="sm">{ad.name}</Text>
                                            </Table.Td>

                                            <Table.Td style={{ verticalAlign: 'middle' }}>
                                                <Badge leftSection={getIcon(ad.adType)} color={ad.adType === "VIDEO" ? "blue" : "green"} variant="light">
                                                    {ad.adType}
                                                </Badge>
                                            </Table.Td>

                                            <Table.Td style={{ verticalAlign: 'middle' }}>
                                                {ad.adDurationSeconds}s
                                            </Table.Td>

                                            <Table.Td style={{ verticalAlign: 'middle' }}>
                                                <Group justify="flex-end">
                                                    <ActionIcon color="red" variant="subtle" onClick={() => onDeleteAd(campaign.campaignId, ad.adId)}>
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                    {campaign.ads.length === 0 && (
                                        <Table.Tr>
                                            <Table.Td colSpan={5} align="center">
                                                <Text c="dimmed" size="sm" py="md">No ads found in this campaign</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}