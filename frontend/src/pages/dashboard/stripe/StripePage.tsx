'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { getEmployeeOrganization } from '@/features/organization-management/api';
import { getStripeAccountStatus, createStripeConnection } from '@/features/payment/api';
import {
    Title,
    Paper,
    Text,
    Button,
    Loader,
    Alert,
    Stack,
    Group,
    ThemeIcon,
    rem
} from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslations } from "next-intl";
import { useSearchParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface StripeStatus {
    connected: boolean;
    onboardingComplete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    stripeAccountId?: string;
}

export default function StripePage() {
    const t = useTranslations('stripe');
    const { user, isLoading: isUserLoading } = useUser();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<StripeStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (user?.sub) {
            try {
                setIsLoading(true);
                const org = await getEmployeeOrganization(user.sub);
                if (org && org.businessId) {
                    const stripeStatus = await getStripeAccountStatus(org.businessId);
                    setStatus(stripeStatus);
                } else {
                    setError(t('errors.noBusiness'));
                }
            } catch (e) {
                console.error("Failed to fetch Stripe status", e);
                const errorMessage = e instanceof Error ? e.message : t('errors.fetchFailed');
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    }, [user, t]);

    useEffect(() => {
        if (!searchParams) return; // Add null check for searchParams

        const onboardingStatus = searchParams.get('onboarding');
        if (onboardingStatus === 'success') {
            notifications.show({
                title: t('notifications.success.title'),
                message: t('notifications.success.message'),
                color: 'teal',
                icon: <IconCheck />,
            });
            // Refetch status after a short delay to allow Stripe to update
            const timer = setTimeout(() => {
                void fetchStatus();
            }, 2000);
            return () => clearTimeout(timer); // Cleanup timer on unmount
        } else if (onboardingStatus === 'refresh') {
            notifications.show({
                title: t('notifications.refresh.title'),
                message: t('notifications.refresh.message'),
                color: 'blue',
            });
        }
    }, [searchParams, t, fetchStatus]);
    
    useEffect(() => {
        if (!isUserLoading) {
            void fetchStatus();
        }
    }, [user, isUserLoading, fetchStatus]);

    const handleConnect = async () => {
        if (!user?.sub) return;

        setIsConnecting(true);
        try {
            const org = await getEmployeeOrganization(user.sub);
            if (org && org.businessId) {
                const response = await createStripeConnection(org.businessId);
                if (response && response.onboardingUrl) {
                    window.location.href = response.onboardingUrl;
                } else {
                    setError(t('errors.connectFailed'));
                }
            } else {
                setError(t('errors.noBusiness'));
            }
        } catch (e) {
            console.error("Failed to connect to Stripe", e);
            let errorMessage = t('errors.connectFailed');

            if (e && typeof e === 'object' && 'response' in e) {
                const response = (e as { response?: { data?: { message?: string }}}).response;
                errorMessage = response?.data?.message || errorMessage;
            } else if (e instanceof Error) {
                errorMessage = e.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsConnecting(false);
        }
    };
    
    const StatusCheck = ({ label, checked }: { label: string, checked: boolean }) => (
        <Group>
            <ThemeIcon color={checked ? 'teal' : 'red'} size={24} radius="xl">
                {checked ? <IconCheck style={{ width: rem(16), height: rem(16) }} /> : <IconX style={{ width: rem(16), height: rem(16) }} />}
            </ThemeIcon>
            <Text>{label}</Text>
        </Group>
    );

    const renderStatus = () => {
        if (!status) {
            return <Text>{t('noStatus')}</Text>;
        }

        const isFullyOnboarded = status.connected && status.onboardingComplete && status.chargesEnabled && status.payoutsEnabled;

        if (isFullyOnboarded) {
            return (
                <Alert icon={<IconCheck size="1rem" />} title={t('status.connected.title')} color="teal">
                    <Text>{t('status.connected.description')}</Text>
                    <Text size="xs" c="dimmed" mt="sm">{t('status.connected.accountId')}: {status.stripeAccountId}</Text>
                </Alert>
            );
        }

        return (
            <Paper withBorder p="md">
                <Stack>
                    <Title order={4}>{t('status.incomplete.title')}</Title>
                    <Text c="dimmed">{t('status.incomplete.description')}</Text>
                    <StatusCheck label={t('status.incomplete.checks.onboarding')} checked={status.onboardingComplete} />
                    <StatusCheck label={t('status.incomplete.checks.charges')} checked={status.chargesEnabled} />
                    <StatusCheck label={t('status.incomplete.checks.payouts')} checked={status.payoutsEnabled} />
                    <Button onClick={handleConnect} loading={isConnecting} mt="md">
                        {status.connected ? t('buttons.continueOnboarding') : t('buttons.connect')}
                    </Button>
                </Stack>
            </Paper>
        );
    };

    return (
        <Stack gap="lg" p="md">
            <Title order={2}>{t('title')}</Title>
            {isLoading || isUserLoading ? (
                <Loader />
            ) : error ? (
                <Alert icon={<IconAlertTriangle size="1rem" />} title="Error" color="red">
                    {error}
                </Alert>
            ) : (
                renderStatus()
            )}
        </Stack>
    );
}
