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
    Input
} from '@mantine/core';
import { DatePicker, type DatesRangeValue } from '@mantine/dates';
import { IconCheck, IconCalendar, IconCreditCard } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { MediaDTO } from "@/types/MediaTypes";
import { getAllAdCampaigns } from "@/services/AdCampaignService";
import { createReservation } from "@/services/ReservationService";
import { AdCampaign } from "@/types/AdTypes";
import dayjs from 'dayjs';
import '@mantine/dates/styles.css';
import { useTranslations } from "next-intl";

interface ReserveMediaModalProps {
    opened: boolean;
    onClose: () => void;
    media: MediaDTO;
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

    useEffect(() => {
        if (opened) {
            const load = async () => {
                try {
                    const data = await getAllAdCampaigns();
                    setCampaigns(data);
                } catch (e) {
                    console.error("Failed to load campaigns", e);
                }
            };
            void load();
        }
    }, [opened]);

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

        // 1. Disable Past Dates
        if (d.isBefore(dayjs(), 'day')) {
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

    const nextStep = () => {
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
        }
        setErrors({});
        setActiveStep((current) => (current < 3 ? current + 1 : current));
    };

    const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

    // typescript
    const handleCheckout = async () => {
        if (!selectedCampaignId || !dateRange[0] || !dateRange[1]) return;

        if (!media.id) {
            notifications.show({ title: t('errorTitle'), message: t('mediaIdMissing'), color: 'red' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                mediaId: media.id,
                campaignId: selectedCampaignId,
                startDate: dayjs(dateRange[0]).format('YYYY-MM-DDTHH:mm:ss'),
                endDate: dayjs(dateRange[1]).format('YYYY-MM-DDTHH:mm:ss'),
                startTime: dayjs(dateRange[0]).format('HH:mm:ss'),
                endTime: dayjs(dateRange[1]).format('HH:mm:ss'),
            };

            await createReservation(payload);
            setActiveStep(3);
            notifications.show({ title: t('successTitle'), message: t('successMessage'), color: 'green' });

        } catch (error: unknown) {
            if (error instanceof Response) {
                if (error.status === 409) {
                    notifications.show({ title: t('duplicateTitle'), message: t('duplicateMessage'), color: 'orange' });
                } else {
                    notifications.show({ title: t('errorTitle'), message: t('failedReserve'), color: 'red' });
                }
            } else {
                notifications.show({ title: t('errorTitle'), message: t('networkError'), color: 'red' });
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            title={<Text fw={700}>{t('title', { title: media.title })}</Text>}
            centered
            padding="xl"
            closeOnClickOutside={activeStep !== 3}
        >
            <Stack gap="xl" p="md">

                <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
                    <Stepper.Step label="Reservation" description="Select dates" icon={<IconCalendar size={18} />} />
                    {/*<Stepper.Step label="Preview" description="How it will look" icon={<IconAd size={18} />} />*/}
                    <Stepper.Step label="Checkout" description="Payment" icon={<IconCreditCard size={18} />} />

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
                                            setErrors({});
                                        }, 200);
                                    }}
                                >
                                    {t('doneButton')}
                                </Button>
                            </Stack>
                        </Center>
                    </Stepper.Completed>
                </Stepper>

                {activeStep < 2 && (
                    <>
                        <Divider />
                        <Box style={{ minHeight: 300 }}>
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
                                            />
                                        </Paper>
                                        {errors.date && (
                                            <Input.Error size="sm" ta="center">{errors.date}</Input.Error>
                                        )}
                                    </Stack>

                                    {dateRange[0] && dateRange[1] && (
                                        <Text c="blue" fw={500}>
                                            Selected: {dayjs(dateRange[0]).format('MMM DD')} to {dayjs(dateRange[1]).format('MMM DD')}
                                            {' '}({dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'weeks')} weeks)
                                        </Text>
                                    )}
                                </Stack>
                            )}

                            {/*{activeStep === 1 && (*/}
                            {/*    <Center h={200}>*/}
                            {/*        <Stack align="center">*/}
                            {/*            <IconAd size={48} color="gray" />*/}
                            {/*            <Text>Ad Preview on Media will go here</Text>*/}
                            {/*        </Stack>*/}
                            {/*    </Center>*/}
                            {/*)}*/}

                            {/*{activeStep === 2 && (*/}
                            {activeStep === 1 && (
                                <Stack align="center" gap="md">
                                    <Text size="xl">{t('reviewTitle')}</Text>
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
                                                ${(media.price || 100) * (dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'weeks') || 1)}
                                            </Text>
                                        </Group>
                                    </Paper>
                                </Stack>
                            )}
                        </Box>
                    </>
                )}

                {activeStep < 2 && (
                    <Group justify="center" mt="xl">
                        <Button variant="default" onClick={activeStep === 0 ? onClose : prevStep}>
                            {activeStep === 0 ? t('cancelButton') : t('backButton')}
                        </Button>

                        {activeStep < 2 ? (
                            <Button onClick={nextStep}>{t('nextStepButton')}</Button>
                        ) : (
                            <Button onClick={handleCheckout} loading={loading} color="green">{t('confirmPayButton')}</Button>
                        )}
                    </Group>
                )}
            </Stack>
        </Modal>
    );
}
