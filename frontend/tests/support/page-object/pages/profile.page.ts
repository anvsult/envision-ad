import { Page } from '@playwright/test';

export default class ProfilePage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    editProfileButton = () => this.page.getByRole('button', { name: 'Edit Profile' });

    // Modal Locators
    modalTitle = () => this.page.getByRole('heading', { name: 'Edit Profile' });
    usernameInput = () => this.page.getByRole('textbox', { name: 'Username' });
    firstNameInput = () => this.page.getByRole('textbox', { name: 'First Name' });
    lastNameInput = () => this.page.getByRole('textbox', { name: 'Last Name' });
    bioInput = () => this.page.getByRole('textbox', { name: 'Bio' });
    saveButton = () => this.page.getByRole('button', { name: 'Save' });
    cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });

    // Display Locators
    bioDisplay = () => this.page.getByText('Bio').locator('xpath=following-sibling::*');

    // Actions
    public async clickEditProfile() {
        await this.editProfileButton().click();
    }

    public async updateProfile(firstName: string, lastName: string, nickname: string, bio: string) {
        await this.modalTitle().waitFor({ state: 'visible' });
        await this.firstNameInput().fill(firstName);
        await this.lastNameInput().fill(lastName);
        await this.usernameInput().fill(nickname);
        await this.bioInput().fill(bio);
        await this.saveButton().click();
        await this.modalTitle().waitFor({ state: 'hidden' });
    }
}
