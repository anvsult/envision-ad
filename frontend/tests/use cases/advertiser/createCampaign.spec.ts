import { test } from "../../fixtures/basePages";

test('createCampaign', async ({ homePage, campaignsPage }) => {
    await homePage.goto();
    await homePage.login("megadoxs", "Password1!");

    await campaignsPage.goto();
    await campaignsPage.clickMyCampaignsLink();
    await campaignsPage.clickCreateCampaign();

    await campaignsPage.campaignNameInput().fill('My First Campaign');
    await campaignsPage.campaignNameInput().press('Enter');

    await campaignsPage.assertCampaignCreated('My First Campaign');
});
