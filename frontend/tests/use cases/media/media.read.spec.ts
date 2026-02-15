import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Read", () => {
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

    test("reads media list and opens edit details prefilled", async ({ mediaDashboardPage }) => {
        await mediaDashboardPage.ensureLocationExpanded(locationName);
        await mediaDashboardPage.assertMediaVisible("Montreal Downtown Wrap");
        await mediaDashboardPage.openEditForMedia("Montreal Downtown Wrap");

        await mediaDashboardPage.assertEditFormPrefilled({
            title: "Montreal Downtown Wrap",
            displayType: "Digital",
            loopDuration: "15",
            resolutionWidth: "1920",
            resolutionHeight: "1080",
            aspectRatioWidth: "16",
            aspectRatioHeight: "9",
            weeklyPrice: "333.77",
            dailyImpressions: "12000",
        });

        await mediaDashboardPage.cancelButton().click();
        await expect(mediaDashboardPage.modalTitleInput()).toBeHidden();
    });
});
