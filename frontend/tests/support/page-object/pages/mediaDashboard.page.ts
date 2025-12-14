import { Page } from '@playwright/test';

export default class MediaDashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    mediaLink = () => this.page.getByRole('link', { name: 'Media' });

    mediaRow = (name: string) => this.page.getByRole('row').filter({ hasText: name });
    mediaActionMenu = (mediaName: string) => this.mediaRow(mediaName).getByLabel('Open media actions');
    editMenuItem = () => this.page.getByRole('menuitem', { name: 'Edit' });
    mediaNameInput = () => this.page.getByRole('textbox', { name: 'Media Name' });
    priceInput = () => this.page.getByRole('textbox', { name: 'Price (per week)' });
    saveButton = () => this.page.getByRole('button', { name: 'Save' });

    async openMediaActions(name: string) {
        const row = this.mediaRow(name);
        await row.hover();
        await this.mediaActionMenu(name).click();
    }

    // Proxy methods for raw access if needed (optional, but consistent with snippet usage if they don't refactor)
    getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
        return this.page.getByRole(role, options);
    }

    getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]) {
        return this.page.getByText(text, options);
    }
}
