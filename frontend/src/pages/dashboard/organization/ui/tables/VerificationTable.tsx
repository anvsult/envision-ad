"use client";

import {Accordion, Table, Text, Badge, ScrollArea, Group, Loader, ActionIcon, Tooltip} from "@mantine/core";
import {useLocale, useTranslations} from "next-intl";
import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import {useEffect, useState} from "react";
import translate from "translate";
import {IconLanguage} from "@tabler/icons-react";

translate.engine = "google";

interface VerificationHistoryTableProps {
    verifications: VerificationResponseDTO[];
}

interface TranslatedComment {
    translated: string | null;
    isTranslating: boolean;
    showOriginal: boolean;
}

export function VerificationHistoryTable({verifications}: VerificationHistoryTableProps) {
    const t = useTranslations("organization");
    const locale = useLocale();

    const [commentStates, setCommentStates] = useState<Record<string, TranslatedComment>>({});

    const sortedVerifications = [...verifications].sort((a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    useEffect(() => {
        sortedVerifications.forEach((verification) => {
            const { verificationId, comments } = verification;
            if (!comments) return;

            if (commentStates[verificationId]?.translated !== undefined ||
                commentStates[verificationId]?.isTranslating) return;

            setCommentStates((prev) => ({
                ...prev,
                [verificationId]: { translated: null, isTranslating: true, showOriginal: false },
            }));

            translate(comments, { from: locale === "fr" ? "en" : "fr", to: locale })
                .then((translated) => {
                    setCommentStates((prev) => ({
                        ...prev,
                        [verificationId]: { ...prev[verificationId], translated, isTranslating: false },
                    }));
                })
                .catch(() => {
                    setCommentStates((prev) => ({
                        ...prev,
                        [verificationId]: { ...prev[verificationId], translated: comments, isTranslating: false },
                    }));
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedVerifications.map(v => v.verificationId).join(","), locale]);

    const toggleShowOriginal = (verificationId: string) => {
        setCommentStates((prev) => ({
            ...prev,
            [verificationId]: {
                ...prev[verificationId],
                showOriginal: !prev[verificationId]?.showOriginal,
            },
        }));
    };

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
                            layout="fixed"
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={150}>{t("verificationTable.requestDate")}</Table.Th>
                                    <Table.Th w={120}>{t("verificationTable.status")}</Table.Th>
                                    <Table.Th>{t("verificationTable.reason")}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {sortedVerifications.length > 0 ? (
                                    sortedVerifications.map((verification) => {
                                        const state = commentStates[verification.verificationId];
                                        const displayedComment = state?.showOriginal
                                            ? verification.comments
                                            : state?.translated ?? verification.comments;

                                        return (
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
                                                    {verification.comments ? (
                                                        <Group gap="xs" align="center" wrap="nowrap">
                                                            <Text size="sm" style={{ wordBreak: "break-word", flex: 1 }}>
                                                                {displayedComment}
                                                            </Text>
                                                            {state?.isTranslating ? (
                                                                <Loader size="xs" style={{ flexShrink: 0 }} />
                                                            ) : state?.translated && state.translated !== verification.comments ? (
                                                                <Tooltip
                                                                    label={state.showOriginal ? t("showTranslation") : t("showOriginal")}
                                                                    position="top"
                                                                >
                                                                    <ActionIcon
                                                                        size="sm"
                                                                        variant="subtle"
                                                                        color="gray"
                                                                        style={{ flexShrink: 0 }}
                                                                        onClick={() => toggleShowOriginal(verification.verificationId)}
                                                                    >
                                                                        <IconLanguage size={16} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            ) : null}
                                                        </Group>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">—</Text>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })
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