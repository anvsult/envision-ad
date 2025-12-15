import { Page, expect } from "@playwright/test";

export default class AdminMediaReviewPage {
  constructor(private page: Page) {}

  approveButton = () => this.page.getByRole("button", { name: /^Approve$/i });

  confirmApproveButton = () =>
    this.page.getByRole("button", { name: /Yes,\s*approve/i });

  async approve() {
    await expect(this.approveButton()).toBeVisible();
    await this.approveButton().click();

    await expect(this.confirmApproveButton()).toBeVisible();
    await this.confirmApproveButton().click();
  }

  denyButton = () => this.page.getByRole("button", { name: /^Deny$/i });
  confirmDenyButton = () =>
    this.page.getByRole("button", { name: /Yes,\s*deny/i });

  public async deny() {
    await expect(this.denyButton()).toBeVisible();
    await this.denyButton().click();

    await expect(this.confirmDenyButton()).toBeVisible();
    await this.confirmDenyButton().click();
  }
}
