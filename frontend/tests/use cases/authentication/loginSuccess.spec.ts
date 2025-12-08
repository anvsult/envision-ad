import { test } from "../../fixtures/basePages";

test('Login Success', async ({ homePage }) => {
    await homePage.goto();
    await homePage.clickLoginLink();
    await homePage.usernameTextbox().fill('megadoxs');
    await homePage.passwordTextbox().fill('Password1!');
    await homePage.loginButton().click();
    await homePage.assertUserLoggedIn('megadoxs');
});