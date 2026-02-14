import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Update", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const locationName = "Champlain College Saint-Lambert";

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState();

        await attachMediaCrudRoutes(page, state);
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("updates media and reflects changes in list", async ({ mediaDashboardPage }) => {
        const updatedTitle = `Montreal Downtown Updated ${Date.now()}`;

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.openEditForMedia("Montreal Downtown Wrap");
        await mediaDashboardPage.modalTitleInput().fill(updatedTitle);
        await mediaDashboardPage.modalPriceInput().fill("150.75");
        await mediaDashboardPage.submitMediaForm();

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.assertMediaVisible(updatedTitle);
        expect(state.capturedUpdatePayload).not.toBeNull();
        expect(state.capturedUpdatePayload).toMatchObject({
            title: updatedTitle,
            price: 150.75,
        });
    });
});
