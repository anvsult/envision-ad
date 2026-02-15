import path from "path";

import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Create", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const locationName = `UQAM Campus Screen ${Date.now()}`;

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState({ seedLocations: false, seedMedia: false });

        await attachMediaCrudRoutes(page, state);
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("creates media and sends expected payload", async ({ mediaDashboardPage }) => {
        const createdTitle = `E2E Digital Board ${Date.now()}`;
        await mediaDashboardPage.createLocation({
            name: locationName,
            street: "1001 Boul De Maisonneuve E",
            city: "Montreal",
            province: "Quebec",
            country: "Canada",
            postalCode: "H2L 4P9",
        });
        await mediaDashboardPage.assertLocationVisible(locationName);
        await mediaDashboardPage.openAddMediaModalForLocation(locationName);

        await mediaDashboardPage.fillMediaForm({
            title: createdTitle,
            displayType: "Digital",
            loopDuration: "15",
            resolutionWidth: "1920",
            resolutionHeight: "1080",
            aspectRatioWidth: "16",
            aspectRatioHeight: "9",
            weeklyPrice: "250.50",
            dailyImpressions: "12345",
        });
        await mediaDashboardPage.setSingleDaySchedule("Monday", "09:00", "18:00");
        await mediaDashboardPage.uploadMediaImage(
            path.join(__dirname, "../../fixtures/test-ad-image.jpg")
        );
        await mediaDashboardPage.setPreviewCornersIfVisible();
        await mediaDashboardPage.submitMediaForm();

        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.assertMediaVisible(createdTitle);
        const createdLocation = state.locationStore.find((location) => location.name === locationName);

        expect(createdLocation).toBeDefined();
        expect(state.capturedCreateLocationPayload).toMatchObject({
            name: locationName,
            street: "1001 Boul De Maisonneuve E",
            city: "Montreal",
            province: "Quebec",
            country: "Canada",
            postalCode: "H2L 4P9",
        });
        expect(state.capturedCreatePayload).not.toBeNull();
        expect(state.capturedCreatePayload).toMatchObject({
            title: createdTitle,
            price: 250.5,
            dailyImpressions: 12345,
            typeOfDisplay: "DIGITAL",
            mediaLocationId: createdLocation?.id,
        });
        expect(state.capturedCreatePayload?.imageUrl).toBe(
            "https://res.cloudinary.com/demo/image/upload/v1/new-media.jpg"
        );
        expect(typeof state.capturedCreatePayload?.previewConfiguration).toBe("string");
    });
});
