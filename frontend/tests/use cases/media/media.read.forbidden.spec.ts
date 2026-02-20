import { test, expect } from "../../fixtures/basePages";
import {
    attachMediaCrudRoutes,
    createMediaCrudMockState,
    loginAndOpenMediaDashboard,
    type MediaCrudMockState,
} from "./helpers/manageMediaMockServer";

test.describe("Manage Media - Read (Forbidden)", () => {
    test.use({
        baseURL: "http://localhost:3000/en",
    });

    let state: MediaCrudMockState;

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        state = createMediaCrudMockState();

        await attachMediaCrudRoutes(page, state, { denyReadMediaLocations: true });
        await loginAndOpenMediaDashboard({ page, homePage, mediaDashboardPage });
    });

    test("shows empty state when media locations API is denied", async ({ mediaDashboardPage }) => {
        await expect(
            mediaDashboardPage.page.getByText("No locations found. Create one to get started!")
        ).toBeVisible({ timeout: 10000 });
        await expect(
            mediaDashboardPage.page.getByRole("button", {
                name: /Champlain College Saint-Lambert/i,
            })
        ).toHaveCount(0);
        await expect(
            mediaDashboardPage.page.getByRole("button", {
                name: /Mail Champlain/i,
            })
        ).toHaveCount(0);
    });
});
