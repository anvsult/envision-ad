import { test } from "../../fixtures/basePages";

test('Update Media', async ({ page, homePage, mediaDashboardPage }) => {
    await homePage.goto();
    await homePage.clickLoginLink();
    await homePage.usernameTextbox().fill('megadoxs');
    await homePage.passwordTextbox().fill('Password1!');
    await homePage.loginButton().click();
    await homePage.clickDashboardLink();

    await mediaDashboardPage.clickMediaLink();
    await page.waitForTimeout(3000);

    // Self-healing: if previous run failed, revert the name
    const updatedItem = mediaDashboardPage.mediaItem('Montreal Downtown Updated');
    if (await updatedItem.isVisible()) {
        await mediaDashboardPage.openMediaActions('Montreal Downtown Updated');
        await mediaDashboardPage.editMenuItem().click();
        await mediaDashboardPage.mediaNameInput().waitFor({ state: 'visible' });
        await mediaDashboardPage.mediaNameInput().fill('Montreal Downtown Wrap');
        await mediaDashboardPage.priceInput().fill('333.77');
        await mediaDashboardPage.saveButton().click();
        await page.waitForTimeout(3000);
    }

    await mediaDashboardPage.openMediaActions('Montreal Downtown Wrap');
    await mediaDashboardPage.editMenuItem().click();

    await mediaDashboardPage.mediaNameInput().waitFor({ state: 'visible' });
    await mediaDashboardPage.mediaNameInput().fill('Montreal Downtown Updated');
    await mediaDashboardPage.priceInput().fill('15074.77');
    await mediaDashboardPage.saveButton().click();

    await mediaDashboardPage.clickMediaLink();
    await page.waitForTimeout(3000);
    await mediaDashboardPage.openMediaActions('Montreal Downtown Updated');
    await mediaDashboardPage.editMenuItem().click();

    await mediaDashboardPage.mediaNameInput().waitFor({ state: 'visible' });
    await mediaDashboardPage.mediaNameInput().fill('Montreal Downtown Wrap');
    await mediaDashboardPage.priceInput().fill('333.77');
    await mediaDashboardPage.saveButton().click();
});