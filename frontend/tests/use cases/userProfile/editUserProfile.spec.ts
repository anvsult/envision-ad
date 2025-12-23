import { test, expect } from "../../fixtures/basePages";

test('Edit User Profile', async ({ page, homePage, profilePage }) => {
    // 1. Login
    await homePage.goto();
    // Using credentials from other tests
    await homePage.login('anvar', 'NewPassword1!');

    // 2. Navigate to Profile
    // Ensure we are logged in. Note: Display name (nickname) might differ from login username.
    // Use regex to match either initial state 'anv.sult' or updated state 'anvar' to allow re-runs.
    const displayName = /anv\.sult|anvar/i;
    await homePage.assertUserLoggedIn(displayName as any);
    await homePage.viewUserProfile(displayName as any);

    // 3. Verify initial state (optional, or just ensure we are on profile)
    await expect(page).toHaveURL(/.*\/profile/);

    // 4. Update Profile
    const newBio = `Bio updated by Playwright at ${Date.now()}`;
    await profilePage.clickEditProfile();

    // We update bio only for this test to be safe, or we can update other fields too
    await profilePage.updateProfile('Anvar', 'Sult', 'anvar', newBio);

    // 5. Verify Update
    // Click edit profile (saved automatically by updateProfile if checking inside?) 
    // Wait, updateProfile clicks "Save".
    // Expect success notification? 
    await expect(page.getByText('Success!')).toBeVisible();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();

    // Verify displayed bio
    await expect(profilePage.bioDisplay()).toContainText(newBio);
});