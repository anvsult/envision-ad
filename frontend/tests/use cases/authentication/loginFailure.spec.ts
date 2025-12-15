import { test, expect } from "../../fixtures/basePages";


test('Login Failure', async ({ homePage }) => {
    await homePage.goto();
    await homePage.clickLoginLink();
    await homePage.usernameTextbox().fill('megadoxs');
    await homePage.passwordTextbox().fill('Password1!222');
    await homePage.loginButton().click();
    await expect(homePage.loginErrorMessage()).toBeVisible();
});