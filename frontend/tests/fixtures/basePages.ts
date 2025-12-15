import {test as base} from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import DashboardPage from '../support/page-object/pages/dashboard.page';

type MyFixtures = {
    homePage: HomePage;
    dashboardPage: DashboardPage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({page}, run) => {
        await run (new HomePage(page));                 
    },
    dashboardPage: async ({page}, run) => {
        await run (new DashboardPage(page));                 
    }
});

export { expect } from '@playwright/test';