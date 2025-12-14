import { Page } from '@playwright/test';

import { isMobileView } from '../../utils/viewUtils';

export default class MediaDashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    sidebarToggle = () => this.page.getByLabel('Toggle sidebar');
    mediaOwnerAccordion = () => this.page.getByRole('button', { name: 'Media Owner' });
    mediaLink = () => this.page.getByRole('link', { name: 'Media' });

    async clickMediaLink() {
        const mobile = await isMobileView(this.page);

        // On mobile, if the accordion isn't visible, we must toggle the sidebar
        if (mobile && !(await this.mediaOwnerAccordion().isVisible())) {
            const toggle = this.sidebarToggle();
            await toggle.waitFor({ state: 'visible' });
            await toggle.click();
        }

        // Wait for the accordion to be interactable (Drawer animation or rendering)
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
        await item.waitFor();

        const tagName = await item.evaluate((el: Element) => el.tagName);
        if (tagName === 'TR') {
            await item.hover();
        }

        await item.getByLabel('Open media actions').click();
    }

    editMenuItem = () => this.page.getByRole('menuitem', { name: 'Edit' });
    mediaNameInput = () => this.page.getByRole('textbox', { name: 'Media Name' });
    priceInput = () => this.page.getByRole('textbox', { name: 'Price (per week)' });
    saveButton = () => this.page.getByRole('button', { name: 'Save' });

    // Proxy methods for raw access if needed (optional, but consistent with snippet usage if they don't refactor)
    getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
        return this.page.getByRole(role, options);
    }

    getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]) {
        return this.page.getByText(text, options);
    }
}
