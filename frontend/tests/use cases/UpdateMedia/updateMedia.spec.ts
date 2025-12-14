import { test } from "../../fixtures/basePages";

test('Update Media', async ({ homePage, mediaDashboardPage }) => {
    await homePage.goto();
    await homePage.clickLoginLink();
    await homePage.usernameTextbox().fill('megadoxs');
    await homePage.passwordTextbox().fill('Password1!');
    await homePage.loginButton().click();
    await homePage.dashboardLink().click();

    await mediaDashboardPage.mediaLink().click();
    await mediaDashboardPage.openMediaActions('Montreal Downtown Wrap');
    await mediaDashboardPage.editMenuItem().click();

    await mediaDashboardPage.mediaNameInput().fill('Montreal Downtown Updated');
    await mediaDashboardPage.priceInput().fill('15074.77');
    await mediaDashboardPage.saveButton().click();
});