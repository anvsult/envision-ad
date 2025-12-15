import { test as base } from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import DashboardPage from '../support/page-object/pages/dashboard.page';
import BrowsePage from '../support/page-object/pages/browse.page';
import MediaDashboardPage from '../support/page-object/pages/mediaDashboard.page';

type MyFixtures = {
    homePage: HomePage;
    dashboardPage: DashboardPage;
    browsePage: BrowsePage;
    mediaDashboardPage: MediaDashboardPage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({ page }, run) => {
        await run(new HomePage(page));
    },
    dashboardPage: async ({page}, run) => {
        await run (new DashboardPage(page));    
    },
    mediaDashboardPage: async ({ page }, run) => {
        await run(new MediaDashboardPage(page));
    },
    browsePage: async({page}, run) => {
        await run (new BrowsePage(page));
    }
});

export { expect } from '@playwright/test';