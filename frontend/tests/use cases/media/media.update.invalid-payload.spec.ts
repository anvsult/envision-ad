import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Update (Invalid Payload)", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const locationName = "Champlain College Saint-Lambert";

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState();

        await attachMediaCrudRoutes(page, state, { invalidPayloadOnUpdate: true });
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("keeps edit modal open and does not update list when backend rejects payload", async ({
        mediaDashboardPage,
    }) => {
        const attemptedTitle = `Invalid Update ${Date.now()}`;

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.openEditForMedia("Montreal Downtown Wrap");
        await mediaDashboardPage.modalTitleInput().fill(attemptedTitle);
        await mediaDashboardPage.modalPriceInput().fill("150.75");

        await mediaDashboardPage.saveButton().click();

        await expect(mediaDashboardPage.modalTitleInput()).toBeVisible({ timeout: 10000 });
        await expect(mediaDashboardPage.page.getByText("Failed to update media.")).toBeVisible();

        expect(state.capturedUpdatePayload).not.toBeNull();
        expect(state.capturedUpdatePayload).toMatchObject({
            title: attemptedTitle,
            price: 150.75,
        });

        await mediaDashboardPage.page.keyboard.press("Escape");
        await expect(mediaDashboardPage.modalTitleInput()).toBeHidden({ timeout: 10000 });

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.assertMediaVisible("Montreal Downtown Wrap");
        await mediaDashboardPage.assertMediaNotVisible(attemptedTitle);
    });
});
