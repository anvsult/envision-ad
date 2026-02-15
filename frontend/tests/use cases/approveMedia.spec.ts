import { test } from "../fixtures/basePages";

test("Approve Pending Media", async ({
  homePage,
  adminPendingMediaPage,
  adminMediaReviewPage,
}) => {
  // Step 1: Navigate to home page and authenticate as admin
  await homePage.goto();
  await homePage.login("admin", "Password1!");

  // Step 2: Navigate to the Admin Pending Media page
  await adminPendingMediaPage.goto();

  // Step 3: Determine whether there are pending items
  // The page renders either:
  // - a table of pending media
  // - or an empty-state message
  if (await adminPendingMediaPage.hasPendingRows()) {

    // Step 4: Open the first pending media item
    // Clicking the row navigates to the review details page
    await adminPendingMediaPage.openFirstPending();

    // Step 5: Approve the media item
    // This includes:
    // - Clicking the Approve button
    // - Confirming in the modal
    // - Verifying success toast appears
    await adminMediaReviewPage.approveWithConfirm();
  } else {

    // Step 6: If no pending media exists,
    // assert that the empty-state message is displayed
    await adminPendingMediaPage.assertEmpty();
  }
});
