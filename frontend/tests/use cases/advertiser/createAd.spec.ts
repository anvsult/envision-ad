import { test } from "../../fixtures/basePages";
import path from 'path';

test('createAd', async ({ homePage, campaignsPage }) => {
    // Setup: Login and create a campaign first
    await homePage.goto();
    await homePage.login("megadoxs", "Password1!");

    await campaignsPage.goto();
    await campaignsPage.clickMyCampaignsLink();
    await campaignsPage.clickCreateCampaign();

    const campaignName = 'Test Campaign for Ad';
    await campaignsPage.campaignNameInput().fill(campaignName);
    await campaignsPage.campaignNameInput().press('Enter');
    await campaignsPage.assertCampaignCreated(campaignName);

    // Test: Create an ad in the campaign
    await campaignsPage.clickAddAdButton();
    
    await campaignsPage.fillAdForm('My First Ad', 'IMAGE', '15');
    
    const imagePath = path.join(__dirname, '../../fixtures/test-ad-image.jpg');
    await campaignsPage.uploadAdFile(imagePath);

    await campaignsPage.submitAd();

    await campaignsPage.assertAdCreated('My First Ad');

});