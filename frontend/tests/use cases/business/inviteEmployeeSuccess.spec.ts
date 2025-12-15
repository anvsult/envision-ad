import { test, expect } from "../../fixtures/basePages";

test('Invite Employee Success', async ({ homePage, dashboardPage }) => {
    await homePage.goto();
    await homePage.login('megadoxs', 'Password1!');
    await dashboardPage.goto();
    await dashboardPage.clickEmployees();
    await dashboardPage.inviteEmployeeButton().click();
    await dashboardPage.inviteEmailTextbox().fill('play@test.com');
    await dashboardPage.submitInviteButton().click();
    await expect(dashboardPage.invitation('play@test.com')).toBeVisible();
});