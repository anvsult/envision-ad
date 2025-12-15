import { isMobileView } from '../../../utils/viewUtils';
import { expect, Page } from '@playwright/test';

export default class CampaignsPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('http://localhost:3000/en/dashboard/advertiser/campaigns');
    }

    //Locators - non-authenticated user

    //Locators - authenticated userd
    hamburgerMenuButton = () => this.page.getByRole('banner').getByRole('button');
    myCampaignsLink = () => this.page.getByRole('link', { name: 'My Campaigns' })
    createCampaignButton = () => this.page.getByRole('button', { name: 'Create Campaign' });

    campaignNameInput = () => this.page.getByPlaceholder('Campaign name');
    
    // Create Ad locators
    addAdButton = () => this.page.getByRole('button', { name: 'Create Ad' }).first()
    
    adNameInput = () => this.page.getByPlaceholder('Ad Name');
    adDurationSelect = () => this.page.getByLabel('Duration in Seconds');
    uploadButton = () => this.page.getByRole('button', { name: /upload/i });
    
    public async clickMyCampaignsLink() {
        const mobile = await isMobileView(this.page);

            if (mobile) {
                await this.hamburgerMenuButton().click();
            }
            await this.myCampaignsLink().click(); 
    }

    public async clickCreateCampaign() {
        await this.createCampaignButton().click();
    }

    public async assertCampaignCreated(campaignName: string) {
        await expect(this.page.getByText(campaignName).first()).toBeVisible();
    }

    public async clickAddAdButton() {
        await this.addAdButton().click();
        // Wait for modal to open
        await expect(this.adNameInput()).toBeVisible({ timeout: 5000 });
    }

    public async fillAdForm(adName: string, adType: 'IMAGE' | 'VIDEO', duration: string) {
        await this.adNameInput().fill(adName);
    }

    public async uploadAdFile(filePath: string) {
        // Click the Upload File button to open Cloudinary widget
        await this.page.getByRole('button', { name: 'Upload File' }).click();
        
        // Get the Cloudinary iframe and interact with it
        const cloudinaryFrame = this.page.locator('[data-test="uw-iframe"]').contentFrame();
        
        // Set up file chooser listener before clicking "Choose File"
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        
        // Click "Choose File" button in the widget to trigger file chooser
        await cloudinaryFrame.getByRole('button', { name: 'Choose File' }).click();
        
        // Wait for file chooser and set the file
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(filePath);
        
        // Click the "Done" button in the widget
        await cloudinaryFrame.locator('div').filter({ hasText: /^Done$/ }).nth(2).click();
        
        // Click the final submit button in the modal
        await this.page.locator('div:nth-child(7) > button:nth-child(2)').click();
    }

    public async submitAd() {
        await this.page.locator('div:nth-child(7) > button:nth-child(2)').click();
    }

    public async assertAdCreated(campaignName: string, adName: string) {
        // Wait for the ad to appear in the table
        await this.page.getByRole('button', { name: campaignName }).first().click();
        const adRow = this.page.locator('table tbody tr').filter({ hasText: adName }).first();
        await expect(adRow).toBeVisible({ timeout: 10000 });
    }
}