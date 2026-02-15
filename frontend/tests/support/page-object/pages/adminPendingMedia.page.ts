import { Page, expect } from "@playwright/test";

export default class AdminPendingMediaPage {
  constructor(private page: Page) {}

  emptyState = () => this.page.getByText(/No pending media to approve\./i);

  tableRows = () => this.page.locator("tbody tr");

  async goto() {
    await this.page.goto(
      "http://localhost:3000/en/dashboard/admin/media/pending",
    );
    await expect(this.page).toHaveURL(/\/en\/dashboard\/admin\/media\/pending/);

    // Let the page render either rows or empty state
    await this.page.waitForLoadState("networkidle");
  }

  async hasPendingRows(): Promise<boolean> {
    // Wait until either rows exist or empty state exists
    await Promise.race([
      this.tableRows()
        .first()
        .waitFor({ state: "visible" })
        .catch(() => {}),
      this.emptyState()
        .waitFor({ state: "visible" })
        .catch(() => {}),
    ]);

    return (await this.tableRows().count()) > 0;
  }

  async assertEmpty() {
    await expect(this.emptyState()).toBeVisible();
  }

  async openFirstPending() {
    const firstRow = this.tableRows().first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();
  }

  async openMediaByTitle(title: string) {
    const row = this.page.locator("tbody tr", { hasText: title }).first();
    await expect(row).toBeVisible();
    await row.click();
  }
}
