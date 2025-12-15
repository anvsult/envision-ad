import {test as base} from '@playwright/test';
import HomePage from '../support/page-object/pages/home.page';
import CampaignsPage from "../support/page-object/pages/advertiser/campaigns.page";

type MyFixtures = {
    homePage: HomePage;
    campaignsPage: CampaignsPage
};

export const test = base.extend<MyFixtures>({
    homePage: async ({page}, run) => {
        await run (new HomePage(page));                 
    },
    campaignsPage: async ({page}, run) => {
        await run (new CampaignsPage(page));
    }
});

export { expect } from '@playwright/test';