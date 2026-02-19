import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Create (Invalid Address)", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;
    const locationName = `Invalid Address Location ${Date.now()}`;

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState({ seedLocations: false, seedMedia: false });

        await attachMediaCrudRoutes(page, state, { invalidAddressOnCreateLocation: true });
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("keeps create location modal open and shows validation feedback", async ({
        mediaDashboardPage,
    }) => {
        await mediaDashboardPage.createLocationButton().click();
        await expect(mediaDashboardPage.locationModalTitle()).toBeVisible({ timeout: 10000 });

        await mediaDashboardPage.locationNameInput().fill(locationName);
        await mediaDashboardPage.locationStreetInput().fill("123 Fake Street");
        await mediaDashboardPage.locationCityInput().fill("Montreal");
        await mediaDashboardPage.locationProvinceInput().fill("Quebec");
        await mediaDashboardPage.locationCountryInput().fill("Canada");
        await mediaDashboardPage.locationPostalCodeInput().fill("H2L 4P9");

        await mediaDashboardPage.locationCreateButton().click();

        await expect(mediaDashboardPage.locationModalTitle()).toBeVisible({ timeout: 10000 });
        await expect(mediaDashboardPage.locationStreetInput()).toHaveAttribute("aria-invalid", "true");
        await expect(mediaDashboardPage.locationCityInput()).toHaveAttribute("aria-invalid", "true");
        await expect(
            mediaDashboardPage.page.getByText("Please verify the street name or number.")
        ).toBeVisible();

        expect(state.locationStore).toHaveLength(0);
        expect(state.capturedCreateLocationPayload).toMatchObject({
            name: locationName,
            street: "123 Fake Street",
            city: "Montreal",
            province: "Quebec",
            country: "Canada",
            postalCode: "H2L 4P9",
        });
    });
});
