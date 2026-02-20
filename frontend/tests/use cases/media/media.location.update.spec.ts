import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media Location - Update", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const originalLocationName = "Champlain College Saint-Lambert";

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState({ seedLocations: true, seedMedia: false });

        await attachMediaCrudRoutes(page, state);
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("updates media location and refreshes list", async ({ mediaDashboardPage }) => {
        const updatedLocationName = `Updated Location ${Date.now()}`;

        await mediaDashboardPage.updateLocation(originalLocationName, {
            name: updatedLocationName,
            city: "Longueuil",
        });

        await mediaDashboardPage.assertLocationVisible(updatedLocationName);
        await mediaDashboardPage.assertLocationNotVisible(originalLocationName);

        expect(state.capturedUpdateLocationPayload).not.toBeNull();
        expect(state.capturedUpdateLocationPayload).toMatchObject({
            name: updatedLocationName,
            city: "Longueuil",
        });

        const updatedLocation = state.locationStore.find(
            (location) => location.id === "loc-montreal"
        );
        expect(updatedLocation).toBeDefined();
        expect(updatedLocation?.name).toBe(updatedLocationName);
        expect(updatedLocation?.city).toBe("Longueuil");
    });
});
