import {test as base} from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';

type MyFixtures = {
    homePage: HomePage;
};

export const test = base.extend<MyFixtures>({
    homePage: async ({page}, run) => {
        await run (new HomePage(page));                 
    },
});

export { expect } from '@playwright/test';