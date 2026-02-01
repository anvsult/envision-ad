import { expect, Page } from '@playwright/test';

export default class MediaDetailsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    reserveButton = () => this.page.getByRole('button', { name: 'Reserve' });
    mediaTitle = () => this.page.locator('h1');
    mediaPrice = () => this.page.getByText(/\$\d+/);

    // Actions
    public async clickReserve() {
        await this.reserveButton().click();
    }

    // Assertions
    public async assertReserveButtonVisible() {
        await expect(this.reserveButton()).toBeVisible();
    }

    public async assertMediaTitleVisible(title: string) {
        await expect(this.mediaTitle()).toContainText(title);
    }
}

