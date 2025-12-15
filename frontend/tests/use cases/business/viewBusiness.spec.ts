import { test, expect } from "../../fixtures/basePages";


test('View Success', async ({ homePage, dashboardPage }) => {
    await homePage.goto();
    await homePage.login('megadoxs', 'Password1!');
    await dashboardPage.goto();
    await dashboardPage.clickBusinessOverview();
    await expect(dashboardPage.businessName('Mom & Pop Bakery')).toBeVisible();
});