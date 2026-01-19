"use client";

import {Accordion, Table, Text, Badge, ScrollArea} from "@mantine/core";
import {useTranslations} from "next-intl";
import {VerificationResponseDTO} from "@/entities/organization/model/verification";

interface VerificationHistoryTableProps {
    verifications: VerificationResponseDTO[];
}

export function VerificationHistoryTable({verifications}: VerificationHistoryTableProps) {
    const t = useTranslations("organization");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "green";
            case "DENIED":
                return "red";
            case "PENDING":
                return "yellow";
            default:
                return "gray";
        }
    };

    const sortedVerifications = [...verifications].sort((a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    return (
        <Accordion variant="separated">
            <Accordion.Item value="verificationHistory">
                <Accordion.Control>{t("verificationHistory")}</Accordion.Control>
                <Accordion.Panel>
                    <ScrollArea>
                        <Table
                            striped
                            highlightOnHover
                            withTableBorder={false}
                            withColumnBorders={false}
                            verticalSpacing="md"
                            horizontalSpacing="lg"
                            layout="auto"
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th miw={150}>{t("verificationTable.requestDate")}</Table.Th>
                                    <Table.Th miw={120}>{t("verificationTable.status")}</Table.Th>
                                    <Table.Th miw={200}>{t("verificationTable.reason")}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {sortedVerifications.length > 0 ? (
                                    sortedVerifications.map((verification) => (
                                        <Table.Tr key={verification.verificationId}>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(verification.dateCreated).toLocaleDateString()}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color={getStatusColor(verification.status)} variant="light">
                                                    {t(`verificationStatus.${verification.status.toLowerCase()}`)}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c={verification.comments ? "inherit" : "dimmed"}>
                                                    {verification.comments}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                ) : (
                                    <Table.Tr>
                                        <Table.Td colSpan={3}>
                                            <Text ta="center" c="dimmed" py="xl">
                                                {t("verificationTable.noHistory")}
                                            </Text>
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}