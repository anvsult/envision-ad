'use client'

import {OrganizationVerificationTable} from "@/pages/dashboard/admin/ui/tables/OrganizationVerificationTable";
import {OrganizationDetailsModal} from "@/pages/dashboard/admin/ui/modals/OrganizationDetailsModal";
import {Group, Stack, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {VerificationResponseDTO} from "@/entities/organization/model/verification";
import {
    approveOrganizationVerification, denyOrganizationVerification,
    getAllVerificationRequests,
    getOrganizationById
} from "@/features/organization-management/api";
import {OrganizationResponseDTO} from "@/entities/organization";
import {notifications} from "@mantine/notifications";

export default function VerifyingOrganizationDashboard() {
    const t = useTranslations("admin.adminActions");
    const [verificationRequests, setVerificationRequests] = useState<VerificationResponseDTO[]>([]);
    const [organizationDetails, setOrganizationDetails] = useState<OrganizationResponseDTO[]>([]);
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        getAllVerificationRequests().then(setVerificationRequests);
    }, []);

    useEffect(() => {
        const fetchOrganizationDetails = async (businessId: string) => {
            try {
                const response = await getOrganizationById(businessId);
                setOrganizationDetails(prev => [...prev, response]);
            } catch (error) {
                console.error(`Failed to fetch organization details for ${businessId}:`, error);
            }
        };

        verificationRequests.forEach(request => {
            const alreadyFetched = organizationDetails.some(org => org.businessId === request.businessId);
            if (!alreadyFetched) {
                fetchOrganizationDetails(request.businessId);
            }
        });
    }, [verificationRequests, organizationDetails]);

    const handleRequestRemoved = (id: string) => {
        setVerificationRequests(prev => prev.filter(request => request.verificationId !== id));
    };

    const handleRowClick = (request: VerificationResponseDTO) => {
        const org = organizationDetails.find(o => o.businessId === request.businessId);
        if (org) {
            setSelectedOrganization(org);
            setModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedOrganization(null);
    };

    const handleApprove = async () => {
        if (!selectedOrganization) return;

        const verificationRequest = verificationRequests.find(
            req => req.businessId === selectedOrganization.businessId
        );

        if (!verificationRequest) return;

        try {
            await approveOrganizationVerification(
                selectedOrganization.businessId,
                verificationRequest.verificationId
            );

            handleRequestRemoved(verificationRequest.verificationId);
            handleCloseModal();
            notifications.show({
                title: t('success.title'),
                message: t('success.approved'),
                color: 'green'
            });
        } catch {
            notifications.show({
                title: t('errors.title'),
                message: t('errors.approveFailed'),
                color: 'red'
            });
        }
    };

    const handleReject = async (reason: string) => {
        if (!selectedOrganization) return;

        const verificationRequest = verificationRequests.find(
            req => req.businessId === selectedOrganization.businessId
        );

        if (!verificationRequest) return;

        try {
            await denyOrganizationVerification(
                selectedOrganization.businessId,
                verificationRequest.verificationId,
                reason
            );
            handleRequestRemoved(verificationRequest.verificationId);
            handleCloseModal();
            notifications.show({
                title: t('success.title'),
                message: t('success.denied'),
                color: 'green'
            });
        } catch {
            notifications.show({
                title: t('errors.title'),
                message: t('errors.denyFailed'),
                color: 'red'
            });
        }
    };

    const getOrganizationName = (businessId: string): string => {
        const org = organizationDetails.find(o => o.businessId === businessId);
        return org?.name || businessId;
    };

    const isLoading = (businessId: string): boolean => {
        return !organizationDetails.some(org => org.businessId === businessId);
    };

    return (
        <Stack component="main" gap="md" p="md" style={{flex: 1, minWidth: 0}}>
            <Group justify="space-between" align="center">
                <Title order={1}>{t("pendingOrganization")}</Title>
            </Group>

            <OrganizationVerificationTable
                rows={verificationRequests}
                onRequestRemoved={handleRequestRemoved}
                onRowClick={handleRowClick}
                getOrganizationName={getOrganizationName}
                isLoading={isLoading}
            />

            <OrganizationDetailsModal
                opened={modalOpen}
                onClose={handleCloseModal}
                organization={selectedOrganization}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </Stack>
    );
}