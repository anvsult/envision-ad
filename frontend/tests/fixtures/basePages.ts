import {test as base} from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import BrowsePage from '../support/page-object/pages/browse.page';

type MyFixtures = {
    homePage: HomePage;
    browsePage: BrowsePage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({page}, run) => {
        await run (new HomePage(page));                 
    },
    browsePage: async({page}, run) => {
        await run (new BrowsePage(page));
    }
});

export { expect } from '@playwright/test';