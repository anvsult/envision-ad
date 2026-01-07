import { isMobileView } from '../../utils/viewUtils';
import { expect, Page } from '@playwright/test';

export default class HomePage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('http://localhost:3000');
    }

    //Locators - non-authenticated user
    loginLink = () => this.page.getByRole('button', { name: 'Sign In' });
    signupLink = () => this.page.getByRole('button', { name: 'Register' });
    languageButton = () => this.page.getByRole('button', { name: 'Switch language' });
    homeLink = () => this.page.getByRole('link', { name: 'Home' });
    browseLink = () => this.page.getByRole('link', { name: 'Browse' });

    usernameTextbox = () => this.page.getByRole('textbox', { name: 'Username or Email address' });
    passwordTextbox = () => this.page.getByRole('textbox', { name: 'Password' });
    loginButton = () => this.page.getByRole('button', { name: 'Continue', exact: true });

    //Locators - authenticated user
    dashboardLink = () => this.page.getByRole('link', { name: 'Dashboard' });
    loginErrorMessage = () => this.page.getByText('Incorrect email address, username, or password');
    userDropdown = (username: string) => this.page.getByRole('button', { name: username })
    profileLink = () => this.page.getByRole('menuitem', { name: 'Profile' });
    logoutLink = () => this.page.getByRole('button', { name: 'Logout' });
    hamburgerMenuButton = () => this.page.getByRole('banner').getByRole('button');

    //Actions
    public async clickLoginLink() {
        const mobile = await isMobileView(this.page);

        if (mobile) {
            await this.hamburgerMenuButton().click();
        }
        await this.loginLink().click();
    }

    public async clickLogoutLink(username: string) {
        await this.userDropdown(username).click();
        await this.logoutLink().click();
    }

    public async clickDashboardLink() {
        const mobile = await isMobileView(this.page);

        if (mobile) {
            await this.hamburgerMenuButton().click();
        }
        await this.dashboardLink().click();
    }

    public async login(username: string, password: string) {
        await this.clickLoginLink();
        await this.usernameTextbox().fill(username);
        await this.passwordTextbox().fill(password);
        await this.loginButton().click();
    }

    public async assertUserLoggedIn(username: string) {
        const mobile = await isMobileView(this.page);

        if (mobile) {
            await this.hamburgerMenuButton().click();
        }
        await expect(this.userDropdown(username)).toBeVisible({ timeout: 15000 });
    }

    public async viewUserProfile(username: string) {
        await this.userDropdown(username).click();
        await this.profileLink().click();
    }
}