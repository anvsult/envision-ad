import { test as base } from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import CampaignsPage from "../support/page-object/pages/advertiser/campaigns.page";
import DashboardPage from '../support/page-object/pages/dashboard.page';
import BrowsePage from '../support/page-object/pages/browse.page';
import MediaDashboardPage from '../support/page-object/pages/mediaDashboard.page';
import ProfilePage from '../support/page-object/pages/profile.page';
import MediaDetailsPage from '../support/page-object/pages/mediaDetails.page';
import ReservationPage from '../support/page-object/pages/advertiser/reservation.page';

type MyFixtures = {
    homePage: HomePage;
    dashboardPage: DashboardPage;
    browsePage: BrowsePage;
    mediaDashboardPage: MediaDashboardPage;
    campaignsPage: CampaignsPage;
    profilePage: ProfilePage;
    mediaDetailsPage: MediaDetailsPage;
    reservationPage: ReservationPage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({ page }, run) => {
        await run(new HomePage(page));
    },
    campaignsPage: async ({ page }, run) => {
        await run(new CampaignsPage(page));
    },
    dashboardPage: async ({ page }, run) => {
        await run(new DashboardPage(page));
    },
    mediaDashboardPage: async ({ page }, run) => {
        await run(new MediaDashboardPage(page));
    },
    browsePage: async ({ page }, run) => {
        await run(new BrowsePage(page));
    },
    profilePage: async ({ page }, run) => {
        await run(new ProfilePage(page));
    },
    mediaDetailsPage: async ({ page }, run) => {
        await run(new MediaDetailsPage(page));
    },
    reservationPage: async ({ page }, run) => {
        await run(new ReservationPage(page));
    }
});

export { expect } from '@playwright/test';