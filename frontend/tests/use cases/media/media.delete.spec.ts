import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Delete", () => {
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

    test("deletes media and removes it from list", async ({ mediaDashboardPage }) => {
        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.deleteMedia("Montreal Downtown Wrap");

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.assertMediaNotVisible("Montreal Downtown Wrap");
        expect(state.capturedDeletedIds).toContain("media-1");
    });
});
