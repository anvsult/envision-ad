import { Page, expect } from "@playwright/test";

export default class AdminPendingMediaPage {
  constructor(private page: Page) {}

  tableRows = () => this.page.locator("tbody tr");

  async openFirstPendingMedia(): Promise<string> {
    const firstRow = this.tableRows().first();
    await expect(firstRow).toBeVisible();

    const title = (await firstRow.locator("td").nth(1).innerText()).trim();
    await firstRow.click();

    return title;
  }
}
