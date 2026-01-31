import { test } from '../../fixtures/basePages';
import { TestMediaTitles } from '../../support/page-object/pages/browse.page';

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

const formatDateLabel = (date: Date) =>
    `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`

const today = new Date()

const TEST_USERS = {
    advertiser: {
        username: 'megadoxs',
        password: 'Password1!'
    }
}

const TEST_CAMPAIGNS = {
    summerSale: 'Summer Sale'
}

const TEST_PAYMENT_DETAILS = {
    default: {
        email: 'test@email.com',
        cardNumber: '4242424242424242',
        expiration: '12/34',
        cvc: '123',
        cardholderName: 'Test User',
        postalCode: 'Q1Q1Q1'
    },
    insufficientFunds: {
        email: 'test@email.com',
        cardNumber: '4000000000009995',
        expiration: '12/34',
        cvc: '123',
        cardholderName: 'Test User',
        postalCode: 'Q1Q1Q1'
    }
}

const TEST_DATE_RANGES = {
    shortTerm: (() => {
        const start = addDays(today, 7);
        const end = addDays(start, 14);

        return {
            start: formatDateLabel(start),
            end: formatDateLabel(end)
        }
    })(),
    midTerm: (() => {
        const start = addDays(today, 21);
        const end = addDays(start, 28);

        return {
            start: formatDateLabel(start),
            end: formatDateLabel(end)
        }
    })()
}

test.describe('Ad Reservation Flow', () => {
    test.beforeEach(async ({ homePage }) => {
        await homePage.goto();
        await homePage.login(TEST_USERS.advertiser.username, TEST_USERS.advertiser.password);
    });

    test('should successfully reserve an ad spot on a media', async ({
        browsePage,
        mediaDetailsPage,
        reservationPage
    }) => {
        test.setTimeout(120000); // Increase timeout to 2 minutes for this test

        // Navigate to browse page
        await browsePage.goto();

        // Select a media
        await browsePage.selectMedia(TestMediaTitles.lolaSalonMainLobby);

        // Verify we're on the media details page and initiate reservation
        await mediaDetailsPage.assertReserveButtonVisible();
        await mediaDetailsPage.clickReserve();

        // Complete the reservation with dates and campaign
        await reservationPage.selectCampaign(TEST_CAMPAIGNS.summerSale);
        await reservationPage.selectStartDate(TEST_DATE_RANGES.shortTerm.start);
        await reservationPage.selectEndDate(TEST_DATE_RANGES.shortTerm.end);

        // Proceed to review
        await reservationPage.proceedToReview();

        // Proceed to payment
        await reservationPage.proceedToPayment();

        // Verify payment form loaded
        await reservationPage.assertPaymentFormVisible();

        // Fill payment details using test card
        await reservationPage.fillPaymentDetails(TEST_PAYMENT_DETAILS.default);

        // Submit payment
        await reservationPage.submitPayment();

        // Verify reservation successful
        await reservationPage.assertReservationSuccessful();
    });

    test('should fail reservation with insufficient funds', async ({
        browsePage,
        mediaDetailsPage,
        reservationPage
    }) => {
        // Navigate to browse page
        await browsePage.goto();

        // Select a media
        await browsePage.selectMedia(TestMediaTitles.lolaSalonMainLobby);

        // Initiate reservation
        await mediaDetailsPage.clickReserve();

        // Complete the reservation flow with insufficient funds card
        await reservationPage.selectCampaign(TEST_CAMPAIGNS.summerSale);
        await reservationPage.selectStartDate(TEST_DATE_RANGES.shortTerm.start);
        await reservationPage.selectEndDate(TEST_DATE_RANGES.shortTerm.end);
        await reservationPage.proceedToReview();
        await reservationPage.proceedToPayment();
        
        // Fill payment details with insufficient funds card
        await reservationPage.assertPaymentFormVisible();
        await reservationPage.fillPaymentDetails(TEST_PAYMENT_DETAILS.insufficientFunds);
        await reservationPage.submitPayment();

        // Verify reservation failed
        await reservationPage.assertReservationFailed();
    });

    test('should allow selecting different date ranges', async ({
        browsePage,
        mediaDetailsPage,
        reservationPage
    }) => {
        // Navigate to browse page
        await browsePage.goto();

        // Select a media
        await browsePage.selectMedia(TestMediaTitles.lolaSalonMainLobby);

        // Verify we're on the media details page and initiate reservation
        await mediaDetailsPage.assertReserveButtonVisible();
        await mediaDetailsPage.clickReserve();

        // Complete the reservation with dates and campaign
        await reservationPage.selectCampaign(TEST_CAMPAIGNS.summerSale);
        await reservationPage.selectStartDate(TEST_DATE_RANGES.midTerm.start);
        await reservationPage.selectEndDate(TEST_DATE_RANGES.midTerm.end);

        // Proceed to review
        await reservationPage.proceedToReview();

        // Proceed to payment
        await reservationPage.proceedToPayment();

        // Verify payment form loaded
        await reservationPage.assertPaymentFormVisible();

        // Fill payment details using test card
        await reservationPage.fillPaymentDetails(TEST_PAYMENT_DETAILS.default);

        // Submit payment
        await reservationPage.submitPayment();

        // Verify reservation successful
        await reservationPage.assertReservationSuccessful();
    });
});

