import { test } from "../../fixtures/basePages";
import { SortSelectOptions, TestMediaTitles } from "../../support/page-object/pages/browse.page";

test.use({
    geolocation: { longitude: -73.52042388916016, latitude: 45.51639175415039 }, // Champlain College Geolocation
    permissions: ['geolocation'],
});
    
test('Browse Search Title LED', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.searchTitle('LED');
    await browsePage.assertMediaCardElementToContainText('Title0', 'Eaton Centre LED Wall');
});

test('Browse Search Address Toronto Canada', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.searchAddress('Toronto, Canada');
    await browsePage.assertMediaCardElementToContainText('Title0', 'Eaton Centre LED Wall');
});

test('Browse Filter Price Min 220 Max 250', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.addPriceFilter(220, 250);
    await browsePage.assertMediaCardElementToContainText('Price0', '$220 per week');
    await browsePage.assertMediaCardElementToContainText('Price1', '$250 per week');
});


test('Browse Filter Impressions Min 45000', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.addMinimumImpressionsFilter(45000);
    await browsePage.assertMediaCardElementToContainText('Impressions0', '~45000 daily impressions');
    await browsePage.assertMediaCardElementToContainText('Impressions1', '~47000 daily impressions');
    await browsePage.assertMediaCardElementToContainText('Impressions2', '~50000 daily impressions');
});

test('Browse Nearest', async ({ browsePage }) => {
  await browsePage.goto();
  await browsePage.selectSortOption(SortSelectOptions.Nearest);
  await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.montrealDowntownWrap);
  await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.parliamentHillDigitalBoard);
  await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.parliamentHillVisitorScreen);
  await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.downtownDigitalBoard);
});

test('Browse Search Title No Media', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.searchTitle('No Media');
    await browsePage.assertNoMediaFoundVisible();
});