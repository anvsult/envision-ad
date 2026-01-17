import { Page, expect } from '@playwright/test';

import { isMobileView } from '../../utils/viewUtils';

export default class MediaDashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    sidebarToggle = () => this.page.getByLabel('Toggle navigation');
    dashboardButton = () => this.page.getByText('Dashboard').filter({ visible: true });
    mediaOwnerAccordion = () => this.page.getByRole('button', { name: 'Media Owner' });
    mediaLink = () => this.page.getByRole('link', { name: 'Media', exact: true });

    async clickMediaLink() {
        const mobile = await isMobileView(this.page);

        // On mobile, navigation is inside the drawer
        if (mobile) {
            if (!(await this.dashboardButton().isVisible())) {
                const toggle = this.sidebarToggle();
                await toggle.waitFor({ state: 'visible' });
                await toggle.click();
            }

            if (!(await this.mediaOwnerAccordion().isVisible())) {
                await this.dashboardButton().click();
            }
        }

        // Wait for the accordion to be interactable
        await this.mediaOwnerAccordion().waitFor();

        // Ensure Media Owner accordion is expanded
        if (!(await this.mediaLink().isVisible())) {
            await this.mediaOwnerAccordion().click();
        }

        await this.mediaLink().click();
    }

    // Separate locators for clearer debugging and less strict-mode collision
    tableRow = (name: string) => this.page.locator('tr').filter({ hasText: name });
    mobileCard = (name: string) => this.page.locator('.mantine-Card-root, div[style*="border"], div[class*="Card"]').filter({ hasText: name });

    // Robust locator: Find the text first, then find its container (row or card)
    mediaItem = (name: string) => this.page.getByText(name).locator('xpath=ancestor::tr | ancestor::div[contains(@class, "mantine-Card-root")]').first();

    mediaActionMenu = (mediaName: string) => this.mediaItem(mediaName).getByLabel('Open media actions');

    async openMediaActions(name: string) {
        const item = this.mediaItem(name);
        await item.scrollIntoViewIfNeeded();
        await item.waitFor();

        const tagName = await item.evaluate((el: Element) => el.tagName);
        if (tagName === 'TR') {
            await item.hover();
        }

        const actionBtn = item.getByLabel('Open media actions');
        await actionBtn.waitFor({ state: 'visible' });

        await expect(async () => {
            await actionBtn.click({ force: true });
            await expect(this.page.getByRole('menuitem').first()).toBeVisible({ timeout: 2000 });
        }).toPass({ timeout: 10000 });
    }

    addMediaButton = () => this.page.getByRole('button', { name: 'Add new media' });

    // Modal Locators
    modalTitleInput = () => this.page.getByRole('textbox', { name: 'Media Name' });
    modalDisplayTypeSelect = () => this.page.getByRole('textbox', { name: 'Type of display' });
    modalPriceInput = () => this.page.getByLabel('Price (per week)');
    modalImpressionsInput = () => this.page.getByLabel('Daily impressions');
    modalLoopDurationInput = () => this.page.getByPlaceholder('Ex. 12');

    // Resolution split inputs
    modalResolutionWidthInput = () => this.page.getByLabel('Resolution - Width (px)');
    modalResolutionHeightInput = () => this.page.getByLabel('Resolution - Height (px)');

    // Aspect Ratio split inputs
    modalAspectRatioWidthInput = () => this.page.getByLabel('Aspect ratio - Width');
    modalAspectRatioHeightInput = () => this.page.getByLabel('Aspect ratio - Height');

    // Poster dimensions
    modalWidthInput = () => this.page.getByLabel('Width (cm)');
    modalHeightInput = () => this.page.getByLabel('Height (cm)');

    modalFileInput = () => this.page.locator('input[type="file"]');

    // Schedule Locators (simplified for now, asserting they exist or interacting if needed)
    // For this test, we might rely on defaults or simple interaction if required.

    saveButton = () => this.page.getByRole('button', { name: 'Save' });
    cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });

    editMenuItem = () => this.page.getByRole('menuitem', { name: 'Edit' });

    // Legacy locators from previous usage (keeping for compatibility if used elsewhere)
    mediaNameInput = () => this.modalTitleInput();
    priceInput = () => this.modalPriceInput();

    // Proxy methods for raw access if needed (optional, but consistent with snippet usage if they don't refactor)
    getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
        return this.page.getByRole(role, options);
    }

    getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]) {
        return this.page.getByText(text, options);
    }
}
