import { test, expect } from "../../fixtures/basePages";

test('Invite Employee Failure', async ({ homePage, dashboardPage }) => {
    await homePage.goto();
    await homePage.login('megadoxs', 'Password1!');
    await dashboardPage.goto();
    await dashboardPage.clickEmployees();
    await dashboardPage.inviteEmployeeButton().click();
    await dashboardPage.inviteEmailTextbox().fill('otata@@test..com');
    await dashboardPage.submitInviteButton().click();
    await expect(dashboardPage.invitation('otata@@test..com')).not.toBeVisible();
});