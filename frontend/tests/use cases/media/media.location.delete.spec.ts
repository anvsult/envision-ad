import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media Location - Delete", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const locationName = "Mail Champlain";

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState({ seedLocations: true, seedMedia: false });

        await attachMediaCrudRoutes(page, state);
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("deletes location and refreshes list", async ({ mediaDashboardPage }) => {
        await mediaDashboardPage.deleteLocation(locationName);

        await mediaDashboardPage.assertLocationNotVisible(locationName);

        expect(state.capturedDeletedLocationIds).toContain("loc-brossard");
        expect(
            state.locationStore.some((location) => location.id === "loc-brossard")
        ).toBe(false);
    });
});
