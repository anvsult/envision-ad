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
  montrealDowntownWrap = 'Montreal Downtown Wrap',
  parliamentHillDigitalBoard = 'Parliament Hill Digital Board',
  parliamentHillVisitorScreen = 'Parliament Hill Visitor Screen',
  downtownDigitalBoard = 'Downtown Digital Board',
  eatonCentreLEDWall = 'Eaton Centre LED Wall',
  eatonCentreLEDWallNorth = 'Eaton Centre LED Wall - North',
  eatonCentreLEDWallSouth = 'Eaton Centre LED Wall - South',
  unionStationAtriumScreen = 'Union Station Atrium Screen',
  highway401MegaScreen = 'Highway 401 Mega Screen',
  harbourfrontPierScreen = 'Harbourfront Pier Screen',
  harbourfrontMarketScreen = 'Harbourfront Market Screen',
  iceDistrictMegaScreen = 'ICE District Mega Screen',
  iceDistrictArenaBoard = 'ICE District Arena Board',
  icePlazaOutdoorScreen = 'ICE Plaza Outdoor Screen',
  calgaryStadiumDigital = 'Calgary Stadium DIGITAL',
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
    searchTitleBar = () => this.page.getByRole('textbox', { name: 'Search title' })
    searchTitleEnter = () => this.page.getByRole('button').nth(3)
    mediaCard = (index: string) => this.page.locator('#MediaCard' + index)
    noLocation = () => this.page.getByText('Could not get nearest media.')
    noMediaFound = () => this.page.getByText('No media found')
    //Filter Locators
    filterPrice = () => this.page.getByRole('button', { name: 'Price ($)' })
    filterPriceFrom = () => this.page.getByRole('textbox', { name: 'From' })
    filterPriceTo = () => this.page.getByRole('textbox', { name: 'To' })
    filterPriceAdd = () => this.page.getByRole('button', { name: 'Add filter' })
    filterMinimumImpressions = () => this.page.getByRole('button', { name: 'Minimum impressions' })
    filterMinimumImpressionsMinimum = () => this.page.getByRole('textbox', { name: 'Minimum impressions' })
    filterMinimumImpressionsAdd = () => this.page.getByRole('button', { name: 'Add filter' })
    //Sort Locators
    sortSelect = () => this.page.getByRole('textbox', { name: 'Nearest' })
    sortSelectOption = (option: string) => this.page.getByRole('option', { name: option })
    
    
    //Actions
    public async addPriceFilter(min: number, max: number) {
        await this.filterPrice().click();
        await this.filterPriceFrom().fill(min.toString());
        await this.filterPriceTo().fill(max.toString());
        await this.filterPriceAdd().click();
    }

    public async addMinimumImpressionsFilter(min: number) {
        await this.filterMinimumImpressions().click();
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