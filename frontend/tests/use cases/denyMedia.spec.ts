import { test } from "../fixtures/basePages";
import DashboardPage from "../support/page-object/pages/dashboard.page";
import AdminPendingMediaPage from "../support/page-object/pages/adminPendingMedia.page";
import AdminMediaReviewPage from "../support/page-object/pages/adminMediaReview.page";

test("Deny Pending Media", async ({ homePage, page }) => {
  const dashboard = new DashboardPage(page);
  const pending = new AdminPendingMediaPage(page);
  const review = new AdminMediaReviewPage(page);

  // Login
  await homePage.goto();
  await homePage.clickLoginLink();
  await homePage.usernameTextbox().fill("megadoxs");
  await homePage.passwordTextbox().fill("Password1!");
  await homePage.loginButton().click();
  await homePage.assertUserLoggedIn("megadoxs");

  // Go to pending media page
  await dashboard.gotoAdminPendingMedia();
  await dashboard.assertOnPendingMediaPage();

  // Open first pending media
  await pending.openFirstPendingMedia();

  // Deny
  await review.deny();
});
