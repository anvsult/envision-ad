import { test, expect } from "../../fixtures/basePages";

test('Update Business Success', async ({ homePage, dashboardPage }) => {
    await homePage.goto();
    await homePage.login('megadoxs', 'Password1!');
    await dashboardPage.goto();
    await dashboardPage.clickBusinessOverview();
    await dashboardPage.editBusinessButton().click();
    await dashboardPage.businessNameTextbox().fill('New Business Name');
    await dashboardPage.confirmEditBusinessButton().click();
    await expect(dashboardPage.businessName('New Business Name')).toBeVisible();
});