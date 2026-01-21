import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {Box, Button, Stack, Text} from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface PaymentFormProps {
    onSuccess: () => void;
    onBack: () => void;
    amount: number;
}

export function PaymentForm({ onSuccess, onBack, amount }: PaymentFormProps) {
    const t = useTranslations('paymentForm');
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                notifications.show({
                    title: t('paymentFailed'),
                    message: error.message || t('paymentError'),
                    color: 'red',
                });
            } else {
                onSuccess();
            }
        } catch {
            notifications.show({
                title: t('paymentFailed'),
                message: t('unexpectedError'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack align="center" gap="lg" w="100%" maw={500}>
                <Text fw={500} size="lg">{t('enterPaymentDetails')}</Text>
                <Text c="dimmed" size="sm">{t('total', { amount: (amount / 100).toFixed(2) })}</Text>
                <Box w="100%">
                    <PaymentElement />
                </Box>
                <Stack w="100%" gap="sm">
                    <Button
                        type="submit"
                        disabled={!stripe || loading}
                        loading={loading}
                        fullWidth
                    >
                        {t('payButton', { amount: (amount / 100).toFixed(2) })}
                    </Button>
                    <Button
                        variant="default"
                        onClick={onBack}
                        fullWidth
                        disabled={loading}
                    >
                        {t('back')}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}

