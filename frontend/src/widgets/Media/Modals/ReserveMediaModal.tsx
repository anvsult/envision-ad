'use client';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import {
    Modal,
    Button,
    Group,
    Stack,
    Text,
    Stepper,
    Select,
    Center,
    Box,
    Paper,
    Divider,
    ThemeIcon,
    Title,
    Input,
    Loader
} from '@mantine/core';
import { DatePicker, type DatesRangeValue } from '@mantine/dates';
import {IconCheck, IconCalendar, IconCreditCard, IconEye} from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { Media } from "@/entities/media";
import { getAllAdCampaigns } from "@/features/ad-campaign-management/api";
import { createReservation } from "@/features/reservation-management/api";
import { AdCampaign } from "@/entities/ad-campaign";
import dayjs, {Dayjs} from 'dayjs';
import '@mantine/dates/styles.css';
import {useLocale, useTranslations} from "next-intl";
import 'dayjs/locale/fr';
import {getEmployeeOrganization} from "@/features/organization-management/api";
import {useUser} from "@auth0/nextjs-auth0/client";
import {EmbeddedCheckout, EmbeddedCheckoutProvider} from '@stripe/react-stripe-js';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import {createPaymentIntent} from "@/features/payment";
import {checkPaymentStatus} from "@/features/payment/api/checkPaymentStatus";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ReserveMediaModalProps {
    opened: boolean;
    onClose: () => void;
    media: Media;
}

export function ReserveMediaModal({ opened, onClose, media }: ReserveMediaModalProps) {
    const t = useTranslations('reserveModal');
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);

    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<DatesRangeValue<string>>([null, null]);
    const [errors, setErrors] = useState<{ campaign?: string; date?: string }>({});
    const isSmallScreen = useMediaQuery('(max-width: 720px)');
    const locale = useLocale();
    const {user} = useUser();

    // Payment states
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentSucceeded, setPaymentSucceeded] = useState(false);
    // Track the Stripe PaymentIntent id returned by the backend so we can pass it back when creating the reservation
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

    const [stripe, setStripe] = useState<Stripe | null>(null);
    useEffect(() => {
        let mounted = true;
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').then((s) => {
            if (mounted) setStripe(s);
        });
        return () => {
            mounted = false;
        };
    }, []);
    const missingKey = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    useEffect(() => {
        if (!user?.sub) return;

        if (opened) {
            const load = async () => {
                try {
                    const business = await getEmployeeOrganization(user.sub);
                    const data = await getAllAdCampaigns(business.businessId);
                    setCampaigns(data);
                } catch (e) {
                    console.error("Failed to load campaigns", e);
                }
            };
            void load();
        }
    }, [opened, user?.sub]);

    const handleDateChange = (val: DatesRangeValue<string>) => {
        if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));

        if (val[0] && !val[1]) {
            setDateRange([val[0], null]);
            return;
        }

        if (val[0] && val[1]) {
            const startDay = dayjs(val[0]).day();
            const endDay = dayjs(val[1]).day();

            if (startDay !== endDay) {
                notifications.show({ color: 'red', message: t('endDateWeekday') });
                setDateRange([val[0], null]);
                return;
            }
            setDateRange(val);
        } else {
            setDateRange(val);
        }
    };

    const getDayProps = (date: string) => {
        const d = dayjs(date);
        const startDateStr = dateRange[0];
        const endDateStr = dateRange[1];
        const today = dayjs();

        // 1. Disable Today and Past Dates
        if (d.isBefore(today, 'day') || d.isSame(today, 'day')) {
            return { disabled: true };
        }

        // 2. Disable Months not in Schedule
        if (media.schedule?.selectedMonths) {
            const currentMonthName = d.format('MMMM').toUpperCase();
            const isMonthAllowed = media.schedule.selectedMonths.some(m => m.toUpperCase() === currentMonthName);

            if (!isMonthAllowed) {
                return {
                    disabled: true,
                    style: { opacity: 0.3, backgroundColor: '#f1f3f5', cursor: 'not-allowed' }
                };
            }
        }

        // 3. Disable days that don't match the start weekday (if start date is picked)
        if (startDateStr && !endDateStr) {
            const isSameWeekday = d.day() === dayjs(startDateStr).day();
            const isBeforeStart = d.isBefore(dayjs(startDateStr), 'day');

            if (!isSameWeekday || isBeforeStart) {
                return { disabled: true, style: { opacity: 0.3 } };
            }
        }

        return {};
    };

    const nextStep = async () => {
        // Step 0: Campaign & Dates selection -> Step 1: Review
        if (activeStep === 0) {
            const newErrors: { campaign?: string; date?: string } = {};
            let hasError = false;

            if (!selectedCampaignId) {
                newErrors.campaign = t('errors.selectCampaign');
                hasError = true;
            }
            if (!dateRange[0] || !dateRange[1]) {
                newErrors.date = t('errors.selectDate');
                hasError = true;
            }

            if (hasError) {
                setErrors(newErrors);
                return;
            }

            if (!media.id || !media.businessId || !selectedCampaignId) {
                notifications.show({
                    title: t('errorTitle'),
                    message: t('errors.missingPaymentInfo'),
                    color: 'red'
                });
                return;
            }

            // Move to review step
            setErrors({});
            setActiveStep(1);
            return;
        }

        // Step 1: Review -> Step 2: Payment (create checkout session)
        if (activeStep === 1) {
            if (!media.id || !selectedCampaignId || !dateRange[0] || !dateRange[1]) {
                notifications.show({
                    title: t('errorTitle'),
                    message: t('errors.missingPaymentInfo'),
                    color: 'red'
                });
                return;
            }

            setLoading(true);
            try {
                const data = await createPaymentIntent({
                    mediaId: media.id,
                    campaignId: selectedCampaignId,
                    startDate: dayjs(dateRange[0]),
                    endDate: dayjs(dateRange[1])
                });

                // Set client secret for embedded checkout (no redirect)
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                    // store paymentIntentId returned by backend so we can include it when creating reservation
                    if (data.paymentIntentId) setPaymentIntentId(data.paymentIntentId);
                    setActiveStep(2);
                } else {
                    notifications.show({
                        title: t('errorTitle'),
                        message: t('errors.paymentInitFailed'),
                        color: 'red'
                    });
                }
            } catch (error) {
                console.error('Payment init error:', error);
                notifications.show({
                    title: t('errorTitle'),
                    message: t('errors.paymentInitFailed'),
                    color: 'red'
                });
            } finally {
                setLoading(false);
            }
            return;
        }
    };

    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    const handleConfirmReservation = async () => {
        if (!selectedCampaignId || !dateRange[0] || !dateRange[1]) {
            notifications.show({
                title: t('errorTitle'),
                message: t('errors.selectCampaign') + ' & ' + t('errors.selectDate'),
                color: 'red'
            });
            return;
        }

        if (!media.id) {
            notifications.show({ title: t('errorTitle'), message: t('mediaIdMissing'), color: 'red' });
            return;
        }


        setLoading(true);
        try {
            const payload = {
                mediaId: media.id,
                campaignId: selectedCampaignId,
                startDate: dayjs(dateRange[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                endDate: dayjs(dateRange[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                // Include paymentIntentId so backend can verify the payment with Stripe
                ...(paymentIntentId ? { paymentIntentId } : {})
            };

            await createReservation(media.id, payload);

            setActiveStep(3); // Move to completion step

            notifications.show({
                title: t('successTitle'),
                message: t('successMessage'),
                color: 'green'
            });

        } catch (error: unknown) {
            console.error('Failed to create reservation:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status: number; data?: { message?: string } } };

                if (axiosError.response?.status === 409) {
                    notifications.show({
                        title: t('duplicateTitle'),
                        message: t('duplicateMessage'),
                        color: 'orange'
                    });
                } else if (axiosError.response?.status === 403) {
                    notifications.show({
                        title: t('errorTitle'),
                        message: t('missingPermissionErrorMessage'),
                        color: 'red'
                    });
                } else if (axiosError.response?.status === 404) {
                    notifications.show({
                        title: t('errorTitle'),
                        message: t('campaignNotFoundErrorMessage'),
                        color: 'red'
                    });
                } else {
                    const errorMessage = axiosError.response?.data?.message || t('failedReserve');
                    notifications.show({
                        title: t('errorTitle'),
                        message: errorMessage,
                        color: 'red'
                    });
                }
            } else {
                notifications.show({
                    title: t('errorTitle'),
                    message: t('networkError'),
                    color: 'red'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    function billingWeeks(start: Dayjs, end: Dayjs): number {
        if (end.isBefore(start)) {
            // swap so calculation still works if dates are reversed
            [start, end] = [end, start];
        }
        const totalDays = end.diff(start, 'day') + 1; // inclusive end date
        return Math.max(1, Math.ceil(totalDays / 7));
    }

    function billingWeeksLabel(start: Dayjs, end: Dayjs): string {
        const weeks = billingWeeks(start, end);
        return `${weeks} week${weeks > 1 ? 's' : ''}`;
    }

    /**
     * Calculate total cost for UI display only.
     * NOTE: The actual payment amount is calculated and validated on the backend for security.
     * This is just an estimate for the user to see what they'll pay.
     *
     * @returns Estimated total cost in dollars
     */
    const calculateTotalCost = (): number => {
        if (!dateRange[0] || !dateRange[1] || !media.price || media.price <= 0) {
            return 0;
        }

        const weeks = billingWeeks(dayjs(dateRange[0]), dayjs(dateRange[1]));
        return media.price * weeks;
    };

    const checkForPaymentConfirmation = async () => {
        const maxAttempts = 10;
        const pollInterval = 1000; // 1 second

        // If we don't have a paymentIntentId yet, try to recover it from Stripe using the clientSecret
        if (!paymentIntentId) {
            try {
                if (stripe && clientSecret) {
                    // retrievePaymentIntent returns { paymentIntent, error }
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore - stripe types can vary by version; guard at runtime
                    const resp = await stripe.retrievePaymentIntent(clientSecret);
                    const pi = resp?.paymentIntent;
                    if (pi?.id) {
                        setPaymentIntentId(pi.id);
                    } else {
                        console.error('Unable to retrieve paymentIntent id from Stripe:', resp);
                    }
                } else {
                    console.error('No stripe instance or clientSecret available to retrieve payment intent id');
                }
            } catch (err) {
                console.error('Error while retrieving payment intent from Stripe:', err);
            }
        }

        if (!paymentIntentId) {
            // Still don't have an id - abort polling to avoid hitting /payments/status/null
            console.error('No paymentIntentId available, aborting payment confirmation polling');
            notifications.show({
                title: 'Payment Processing',
                message: 'Payment is being processed. If it completes successfully your reservation will be confirmed shortly.',
                color: 'yellow'
            });
            return;
        }

        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));

            try {
                // Check if payment is confirmed in your backend
                const status = await checkPaymentStatus(paymentIntentId);

                if (status.data.status === 'SUCCEEDED') {
                    // Now safe to create reservation
                    await handleConfirmReservation();
                    setActiveStep(3); // Success!
                    return;
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }

        // Timeout - webhook didn't arrive in time
        notifications.show({
            title: 'Payment Processing',
            message: 'Payment is being processed. Your reservation will be confirmed shortly.',
            color: 'yellow'
        });
    };

    /**
     * Format currency for display
     * @param amount - Amount in dollars
     * @returns Formatted currency string (e.g., "123.45")
     */
    const formatCurrency = (amount: number): string => {
        return amount.toFixed(2);
    };

    return (
        <Modal
            opened={opened}
            onClose={() => { onClose()}}
            size="lg"
            title={<Text fw={700}>{t('title', { title: media.title })}</Text>}
            centered
            padding="xl"
            closeOnClickOutside={activeStep !== 3}
        >
            <Stack gap="xl" p="md">

                <Stepper active={activeStep} onStepClick={(step) => {
                    // Only allow going back, not forward
                    if (step < activeStep) setActiveStep(step);
                }} allowNextStepsSelect={false}>
                    <Stepper.Step  icon={<IconCalendar size={18} />} />
                    <Stepper.Step  icon={<IconEye size={18} />} />
                    <Stepper.Step  icon={<IconCreditCard size={18} />} />

                    <Stepper.Completed>
                        <Center py="xl">
                            <Stack align="center" gap="sm">
                                <ThemeIcon color="green" size={80} radius="100%">
                                    <IconCheck size={50} />
                                </ThemeIcon>
                                <Title order={3}>{t('successTitle')}</Title>
                                <Text c="dimmed" ta="center" maw={400}>
                                    {t('successMessageLong')}
                                </Text>
                                <Button
                                    mt="md"
                                    color="green"
                                    onClick={() => {
                                        onClose();
                                        setTimeout(() => {
                                            setActiveStep(0);
                                            setDateRange([null, null]);
                                            setSelectedCampaignId(null);
                                            setErrors({});
                                            setClientSecret(null);
                                            setPaymentSucceeded(false);
                                            // reset stored payment intent id for next flow
                                            setPaymentIntentId(null);
                                        }, 200);
                                    }}
                                >
                                    {t('doneButton')}
                                </Button>
                            </Stack>
                        </Center>
                    </Stepper.Completed>
                </Stepper>

                {activeStep < 3 && (
                    <>
                        <Divider />
                        <Box style={{ minHeight: 300 }}>
                            {/* Step 1: Campaign & Dates */}
                            {activeStep === 0 && (
                                <Stack align="center">
                                    <Select
                                        label={t('selectCampaign')}
                                        placeholder={t('chooseCampaign')}
                                        data={campaigns.map(c => ({ value: c.campaignId, label: c.name }))}
                                        value={selectedCampaignId}
                                        onChange={(val) => {
                                            setSelectedCampaignId(val);
                                            if(val) setErrors(prev => ({...prev, campaign: undefined}));
                                        }}
                                        error={errors.campaign}
                                        style={{ width: '100%', maxWidth: 400 }}
                                        searchable
                                    />

                                    <Text size="sm" c="dimmed" mt="sm">
                                        {t('selectStartDateNote')}
                                    </Text>

                                    <Stack gap={4}>
                                        <Paper
                                            withBorder
                                            p="md"
                                            radius="md"
                                            style={{ borderColor: errors.date ? 'var(--mantine-color-red-filled)' : undefined }}
                                        >
                                            <DatePicker
                                                type="range"
                                                allowSingleDateInRange={false}
                                                value={dateRange}
                                                onChange={handleDateChange}
                                                getDayProps={getDayProps}
                                                numberOfColumns={isSmallScreen ? 1 : 2}
                                                locale={locale}
                                            />
                                        </Paper>
                                        {errors.date && (
                                            <Input.Error size="sm" ta="center">{errors.date}</Input.Error>
                                        )}
                                    </Stack>

                                    {dateRange[0] && dateRange[1] && (
                                        <Text c="blue" fw={500}>
                                            {t('dateSelection.selected', {
                                                start: dayjs(dateRange[0]).format('MMM DD'),
                                                end: dayjs(dateRange[1]).format('MMM DD'),
                                                weeks: billingWeeksLabel(dayjs(dateRange[1]), dayjs(dateRange[0]))
                                            })}
                                        </Text>
                                    )}
                                </Stack>
                            )}

                            {/* Step 2: Review & Confirm */}
                            {activeStep === 1 && (
                                <Stack align="center" gap="md">
                                    <Text size="xl" fw={600}>{t('reviewTitle')}</Text>
                                    <Paper withBorder p="lg" w="100%">
                                        <Group justify="space-between">
                                            <Text c="dimmed">{t('labels.media')}:</Text>
                                            <Text fw={500}>{media.title}</Text>
                                        </Group>
                                        <Group justify="space-between" mt="xs">
                                            <Text c="dimmed">{t('labels.campaign')}:</Text>
                                            <Text fw={500}>{campaigns.find(c => c.campaignId === selectedCampaignId)?.name}</Text>
                                        </Group>
                                        <Group justify="space-between" mt="xs">
                                            <Text c="dimmed">{t('labels.dates')}:</Text>
                                            <Text fw={500}>
                                                {dayjs(dateRange[0]).format('MMM D, YYYY')} - {dayjs(dateRange[1]).format('MMM D, YYYY')}
                                            </Text>
                                        </Group>
                                        <Divider my="sm"/>
                                        <Group justify="space-between">
                                            <Text size="lg" fw={700}>{t('labels.totalCost')}:</Text>
                                            <Text size="lg" fw={700} c="blue">
                                                ${formatCurrency(calculateTotalCost())}
                                            </Text>
                                        </Group>
                                    </Paper>
                                </Stack>
                            )}

                            {/* Step 3: Embedded Stripe Checkout */}
                            {activeStep === 2 && clientSecret && !paymentSucceeded && (
                                missingKey ? (
                                    <Text c="red">{t('errors.missingPaymentInfo')}</Text>
                                    ) : stripe ? (
                                <EmbeddedCheckoutProvider
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret,
                                        onComplete: async () => {
                                            // Payment succeeded in Stripe - now create the reservation
                                            console.log('Payment completed, creating reservation...');
                                            setPaymentSucceeded(true);

                                            // Ensure we have a paymentIntentId before polling/creating reservation
                                            if (!paymentIntentId) {
                                                try {
                                                    if (stripe && clientSecret) {
                                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                        // @ts-ignore - stripe types can vary
                                                        const resp = await stripe.retrievePaymentIntent(clientSecret);
                                                        const pi = resp?.paymentIntent;
                                                        if (pi?.id) {
                                                            setPaymentIntentId(pi.id);
                                                        } else {
                                                            console.error('Unable to retrieve paymentIntent id from Stripe onComplete:', resp);
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.error('Failed to retrieve paymentIntent in onComplete:', err);
                                                }
                                            }

                                            await checkForPaymentConfirmation();

                                            try {
                                                // Create the reservation after successful payment (if webhook didn't already)
                                                await handleConfirmReservation();
                                                // Only mark payment as succeeded after reservation creation succeeds
                                                setPaymentSucceeded(true);
                                            } catch (error) {
                                                console.error('Failed to create reservation after payment:', error);
                                                notifications.show({
                                                    color: 'red',
                                                    title: t('errors.reservationCreationFailedTitle'),
                                                    message: t('errors.reservationCreationFailedMessage'),
                                                });
                                            }
                                        }
                                    }}
                                >
                                    <EmbeddedCheckout />
                                </EmbeddedCheckoutProvider>
                            ) : (
                                <Center><Loader/></Center>
                            )
                            )}

                            {/* Step 3: Processing after payment */}
                            {activeStep === 2 && paymentSucceeded && (
                                <Center py="xl">
                                    <Stack align="center" gap="md">
                                        <Loader size="lg" />
                                        <Text size="lg" fw={500}>{t('processingPayment')}</Text>
                                        <Text size="sm" c="dimmed">{t('pleaseWait')}</Text>
                                    </Stack>
                                </Center>
                            )}
                        </Box>
                    </>
                )}

                {activeStep < 3 && !paymentSucceeded && (
                    <Group justify="center">
                        <Button variant="default" onClick={activeStep === 0 ? onClose : prevStep}>
                            {activeStep === 0 ? t('cancelButton') : t('backButton')}
                        </Button>

                        {activeStep <= 1 && (
                            <Button onClick={nextStep} loading={loading}>
                                {t('nextStepButton')}
                            </Button>
                        )}
                    </Group>
                )}
            </Stack>
        </Modal>
    );
}