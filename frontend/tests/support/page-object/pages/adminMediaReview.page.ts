import { Page, expect } from "@playwright/test";

export default class AdminMediaReviewPage {
  constructor(private page: Page) {}

  approveBtn = () => this.page.getByRole("button", { name: "Approve" });
  approveMediaBtn = () =>
    this.page.getByRole("button", { name: "Approve Media" });
  successToast = () => this.page.getByText("Media has been approved");

  async approveWithConfirm() {
    await expect(this.approveBtn()).toBeVisible();
    await this.approveBtn().click();

    await expect(this.approveMediaBtn()).toBeVisible();
    await this.approveMediaBtn().click();

    await expect(this.successToast()).toBeVisible();
  }
}
