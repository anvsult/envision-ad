import { isMobileView } from '../../utils/viewUtils';
import { Page } from '@playwright/test';

export default class DashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('http://localhost:3000/en/dashboard');
    }

    //Locators
    mediaOverviewTab = () => this.page.getByLabel('Media Owner').getByRole('link', { name: 'Overview' });
    yourMediaTab = () => this.page.getByRole('link', { name: 'Media' });
    displayedAdsTab = () => this.page.getByRole('link', { name: 'Displayed ads' });
    adRequestsTab = () => this.page.getByRole('link', { name: 'Ad requests' });

    businessOverviewTab = () => this.page.getByLabel('Business').getByRole('link', { name: 'Overview' });
    employeesTab = () => this.page.getByRole('link', { name: 'Employees' });

    editBusinessButton = () => this.page.getByRole('button', { name: 'Edit' });
    confirmEditBusinessButton = () => this.page.getByRole('button', { name: 'Update' });
    businessNameTextbox = () => this.page.getByRole('textbox', { name: 'Business Name' });
    businessName = (name: string) => this.page.getByRole('heading', { name: name });

    inviteEmployeeButton = () => this.page.getByRole('button', { name: 'Invite Employee' });
    inviteEmailTextbox = () => this.page.getByRole('textbox', { name: 'Email' });
    submitInviteButton = () => this.page.getByLabel('Add Employee').getByRole('button', { name: 'Invite Employee' })
    invitation = (email : string) => this.page.getByRole('cell', { name: email })

    hamburgerMenuButton = () => this.page.getByRole('banner').getByRole('button');


    //Actions
    public async clickBusinessOverview() {
        const mobile = await isMobileView(this.page);

        if (mobile) {
            await this.hamburgerMenuButton().click();
        }
        await this.businessOverviewTab().click();
    }

    public async clickEmployees() {
        const mobile = await isMobileView(this.page);

        if (mobile) {
            await this.hamburgerMenuButton().click();
        }
        await this.employeesTab().click();
    }
}
