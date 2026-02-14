import { test } from "../../fixtures/basePages";
import { SortSelectOptions, TestMediaTitles } from "../../support/page-object/pages/browse.page";

test.use({
    geolocation: { longitude: -73.52042388916016, latitude: 45.51639175415039 }, // Champlain College Geolocation
    permissions: ['geolocation'],
});
    
test('Browse Search Ping Mo', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.searchTitle('Ping Mo');
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.pingMoStoreEntrance);
});

test('Browse Search Address Brossard, Canada', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.Nearest);
    await browsePage.searchAddress('Brossard, Canada');
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.lolaSalonMainLobby);
});

test('Browse Filter Price Min 5 Max 10', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.PriceAsc);
    await browsePage.addPriceFilter(5, 10);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.entrepotEnFolieMainEntrance);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.pingMoStoreEntrance);
});


test('Browse Filter Impressions Min 8000', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.addMinimumImpressionsFilter(8000);
    await browsePage.assertMediaCardElementToContainText('Impressions0', '~11250 weekly impressions');
    await browsePage.assertMediaCardElementToContainText('Impressions1', '~9375 weekly impressions');
});

test('Browse Search Title No Media', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.searchTitle('No Media');
    await browsePage.assertNoMediaFoundVisible();
});