import { expect, Page } from '@playwright/test';

export default class ReservationPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators - Step 1: Date and Campaign Selection
    startDateButton = (date: string) => this.page.getByRole('button', { name: date, exact: true });
    endDateButton = (date: string) => this.page.getByRole('button', { name: date, exact: true });
    // Support both desktop and mobile next month buttons
    nextMonthButtons = () => [
        this.page.locator('div:nth-child(2) > .m_730a79ed > .mantine-focus-auto.m_2351eeb0'), // mobile
        this.page.locator('.m_730a79ed > button:nth-child(3)') // desktop
    ];

    campaignSelect = () => this.page.getByRole('textbox', { name: 'Select Campaign' });
    campaignOption = (campaignName: string) => this.page.getByRole('option', { name: campaignName });
    nextStepButton = () => this.page.getByRole('button', { name: 'Next step' });

    // Locators - Payment (Stripe Embedded Checkout)
    stripeIframe = () => this.page.locator('iframe[name="embedded-checkout"]').contentFrame();
    emailInput = () => this.stripeIframe().getByRole('textbox', { name: 'Email' });
    cardNumberInput = () => this.stripeIframe().getByRole('textbox', { name: 'Card number' });
    expirationInput = () => this.stripeIframe().getByRole('textbox', { name: 'Expiration' });
    cvcInput = () => this.stripeIframe().getByRole('textbox', { name: 'CVC' });
    cardholderNameInput = () => this.stripeIframe().getByRole('textbox', { name: 'Cardholder name' });
    postalCodeInput = () => this.stripeIframe().getByRole('textbox', { name: 'Postal code' });
    submitPaymentButton = () => this.stripeIframe().getByTestId('hosted-payment-submit-button');
    insufficientFundsError = () => this.stripeIframe().getByText('Your credit card was declined because of insufficient funds. Try paying with a debit card instead.');

    // Locators - Success notification
    successNotification = () => this.page.getByRole('heading', { name: 'Reservation Successful!' });

    // Actions - Date and Campaign Selection
    public async selectStartDate(date: string) {
        await this.selectDateWithNavigation(date);
    }

    public async selectEndDate(date: string) {
        await this.selectDateWithNavigation(date);
    }

    public async selectCampaign(campaignName: string) {
        await this.campaignSelect().click();
        await this.campaignOption(campaignName).click();
    }

    public async clickNextStep() {
        await this.nextStepButton().click();
    }

    private async selectDateWithNavigation(date: string) {
        for (let i = 0; i < 12; i += 1) {
            const button = this.page.getByRole('button', { name: date, exact: true }).first();
            try {
                await button.waitFor({ state: 'visible', timeout: 1000 });
                await button.click();
                return;
            } catch {
                // Try both next month buttons (mobile and desktop)
                let clicked = false;
                for (const nextBtn of this.nextMonthButtons()) {
                    try {
                        await nextBtn.waitFor({ state: 'visible', timeout: 1000 });
                        await nextBtn.click();
                        await this.page.waitForTimeout(800);
                        clicked = true;
                        break;
                    } catch {
                        // Try next selector
                    }
                }
                if (!clicked) {
                    break;
                }
            }
        }
        throw new Error(`Date button not found after navigating months: ${date}`);
    }

    public async proceedToReview() {
        await this.clickNextStep();
    }

    public async proceedToPayment() {
        await this.clickNextStep();
    }

    // Actions - Payment
    public async fillPaymentDetails(paymentDetails: {
        email: string;
        cardNumber: string;
        expiration: string;
        cvc: string;
        cardholderName: string;
        postalCode: string;
    }) {
        await this.emailInput().fill(paymentDetails.email);
        await this.cardNumberInput().fill(paymentDetails.cardNumber);
        await this.expirationInput().fill(paymentDetails.expiration);
        await this.cvcInput().fill(paymentDetails.cvc);
        await this.cardholderNameInput().fill(paymentDetails.cardholderName);
        await this.postalCodeInput().fill(paymentDetails.postalCode);
    }

    public async submitPayment() {
        const submitBtn = this.submitPaymentButton();
        
        // Wait for button to be visible and enabled (Stripe validation complete)
        await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
        
        // Wait for Stripe's client-side validation to complete and enable the button
        await this.page.waitForTimeout(1000);
        
        // Click with retry in case button is still processing
        await submitBtn.click({ timeout: 10000 });
    }

    // Complete Reservation Flow
    public async completeReservation(
        startDate: string,
        endDate: string,
        campaignName: string,
        paymentDetails: {
            email: string;
            cardNumber: string;
            expiration: string;
            cvc: string;
            cardholderName: string;
            postalCode: string;
        }
    ) {
        // Step 1: Select dates and campaign
        await this.selectStartDate(startDate);
        await this.selectEndDate(endDate);
        await this.selectCampaign(campaignName);
        await this.proceedToReview();

        // Step 2: Review - proceed to payment
        await this.proceedToPayment();

        // Step 3: Fill payment and submit
        await this.fillPaymentDetails(paymentDetails);
        await this.submitPayment();
    }

    // Assertions
    public async assertReservationSuccessful(timeout = 60000) {
        await expect(this.successNotification()).toBeVisible({ timeout });
    }

    public async assertReservationFailed(timeout = 60000) {
        await expect(this.insufficientFundsError()).toBeVisible({ timeout });
    }

    public async assertNextStepButtonVisible() {
        await expect(this.nextStepButton()).toBeVisible();
    }

    public async assertPaymentFormVisible() {
        await expect(this.emailInput()).toBeVisible({ timeout: 10000 });
    }
}


