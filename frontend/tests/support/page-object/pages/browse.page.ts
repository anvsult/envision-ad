import { expect, Page } from '@playwright/test';



export enum SortSelectOptions {
    Nearest= 'Nearest',
    PriceAsc = 'Price (Low to High)',
    PriceDesc = 'Price (High to Low)',
    ImpressionsAsc = 'Impressions (Low to High)',
    ImpressionsDesc = 'Impressions (High to Low)',
    LoopAsc = 'Loop duration (Low to High)',
    LoopDesc = 'Loop duration (High to Low)'
}

export enum TestMediaTitles {
    lolaSalonMainLobby = 'Lola Salon Main Lobby',
    entrepotEnFolieMainEntrance = 'Entrepôt en Folie Main Entrance',
    gymHallwayDigitalBoard = 'Gym Hallway Digital Board',
    mainEntranceDigitalBoard = 'Main Entrance Digital Board',
    studentLounge1 = 'Student Lounge 1',
    studentLounge2 = 'Student Lounge 2',
    cafetariaEntrance = 'Cafeteria Entrance',
    pingMoStoreEntrance = 'Ping Mo Store Entrance'
}


export default class BrowsePage {
    page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    public async goto() {
        await this.page.goto('http://localhost:3000/en/browse');
    }

    //Locators 
    searchTitleBar = () => this.page.getByRole('textbox', { name: 'Title' })
    searchTitleEnter = () => this.page.getByRole('button').nth(3)
    searchAddressBar = () => this.page.getByRole('textbox', { name: 'Address' })
    searchAddressEnter = () => this.page.getByRole('button').nth(4)


    mediaCard = (index: string) => this.page.locator('#MediaCard' + index)
    noLocation = () => this.page.getByText('Could not get nearest media.')
    noMediaFound = () => this.page.getByText('No media found')
    //Filter Locators
    filterPriceButton = () => this.page.getByRole('button', { name: 'Price ($)' })
    filterPriceFrom = () => this.page.getByRole('textbox', { name: 'From' })
    filterPriceTo = () => this.page.getByRole('textbox', { name: 'To' })
    filterPriceAdd = () => this.page.getByRole('button', { name: 'Add filter' })
    filterMinimumImpressionsButton = () => this.page.getByRole('button', { name: 'Minimum impressions' })
    filterMinimumImpressionsMinimum = () => this.page.getByRole('textbox', { name: 'Minimum impressions' })
    filterMinimumImpressionsAdd = () => this.page.getByRole('button', { name: 'Add filter' })
    //Sort Locators
    sortSelect = () => this.page.locator('#SortSelect')
    sortSelectOption = (option: string) => this.page.getByRole('option', { name: option })
    
    
    //Actions
    public async addPriceFilter(min: number, max: number) {
        await this.filterPriceButton().click();
        await this.filterPriceFrom().fill(min.toString());
        await this.filterPriceTo().fill(max.toString());
        await this.filterPriceAdd().click();
    }

    public async addMinimumImpressionsFilter(min: number) {
        await this.filterMinimumImpressionsButton().click();
        await this.filterMinimumImpressionsMinimum().fill(min.toString());
        await this.filterMinimumImpressionsAdd().click();
    }

    public async selectSortOption(sort: SortSelectOptions) {
        await this.sortSelect().click();
        await this.sortSelectOption(sort).click();
    }

    public async searchTitle(title: string) {
        await this.searchTitleBar().fill(title);
        await this.searchTitleEnter().click();
    }

    public async searchAddress(address: string) {
        await this.searchAddressBar().fill(address);
        await this.searchAddressEnter().click();
    }

    // Assert
    public async assertMediaCardElementToContainText
    (id: string, text: string) {
        await expect(this.mediaCard(id)).toContainText(text);
    }

    public async assertNoLocationVisible() {
        await expect(this.noLocation()).toBeVisible();
    }

    public async assertNoMediaFoundVisible() {
        await expect(this.noMediaFound()).toBeVisible();
    }
}