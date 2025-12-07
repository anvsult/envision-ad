import { Page } from '@playwright/test';

export default class LoginPage {

    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('https://petclinic.benmusicgeek.synology.me/users/login');
    }

    //Locators
    emailOrUsernameTextbox = () => this.page.getByPlaceholder('Enter your email or username');
    passwordTextbox = () => this.page.getByPlaceholder('Enter your password')
    loginButton = () => this.page.getByRole('button', { name: 'Login', exact: true });

    //Actions
    public async loginAs(email: string, password: string) {
        await this.goto();
        await this.emailOrUsernameTextbox().fill(email);
        await this.passwordTextbox().fill(password);
        await this.loginButton().click();
    }

    public async enterCredentials(email: string, password: string) {
        await this.emailOrUsernameTextbox().fill(email);
        await this.passwordTextbox().fill(password);
    }
    public async clickLoginButton() {
        await this.loginButton().click();
    }

    public async waitForLoginURL() {
        await this.page.waitForURL('https://petclinic.benmusicgeek.synology.me/users/login');
    }
}