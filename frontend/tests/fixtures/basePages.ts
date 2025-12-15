import { test as base } from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import CampaignsPage from "../support/page-object/pages/advertiser/campaigns.page";
import BrowsePage from '../support/page-object/pages/browse.page';
import MediaDashboardPage from '../support/page-object/pages/mediaDashboard.page';

type MyFixtures = {
    homePage: HomePage;
    browsePage: BrowsePage;
    mediaDashboardPage: MediaDashboardPage;
    campaignsPage: CampaignsPage
};

export const test = base.extend<MyFixtures>({
    homePage: async ({ page }, run) => {
        await run(new HomePage(page));
    },
    campaignsPage: async ({page}, run) => {
        await run (new CampaignsPage(page));
    },
    mediaDashboardPage: async ({ page }, run) => {
        await run(new MediaDashboardPage(page));
    },
    browsePage: async({page}, run) => {
        await run (new BrowsePage(page));
    }
});

export { expect } from '@playwright/test';