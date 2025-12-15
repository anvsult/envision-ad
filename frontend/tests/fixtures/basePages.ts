import { test as base } from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import MediaDashboardPage from '../support/page-object/pages/mediaDashboard.page';

type MyFixtures = {
    homePage: HomePage;
    mediaDashboardPage: MediaDashboardPage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({ page }, run) => {
        await run(new HomePage(page));
    },
    mediaDashboardPage: async ({ page }, run) => {
        await run(new MediaDashboardPage(page));
    },
});

export { expect } from '@playwright/test';