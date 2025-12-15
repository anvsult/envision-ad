import { Page, expect } from "@playwright/test";

export default class DashboardPage {
  constructor(private page: Page) {}

  private getLocalePrefixFromUrl() {

    const m = this.page.url().match(/\/(en|fr)(\/|$)/i);
    return m ? `/${m[1]}` : "/en";
  }

  async gotoAdminPendingMedia() {
    const locale = this.getLocalePrefixFromUrl();
    await this.page.goto(`http://localhost:3000${locale}/dashboard/admin/medias/pending`);
  }

  async assertOnPendingMediaPage() {
    await expect(this.page).toHaveURL(/\/(en|fr)\/dashboard\/admin\/medias\/pending/i);
  }
}
