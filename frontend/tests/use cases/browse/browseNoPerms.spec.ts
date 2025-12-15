import { test } from "../../fixtures/basePages";
import { SortSelectOptions, TestMediaTitles } from "../../support/page-object/pages/browse.page";

test.use({
    permissions: [],
});

test('Browse No Location', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.assertNoLocationVisible();
});


test('Browse Price Asc', async ({ browsePage }) => {
  await browsePage.goto();
  await browsePage.selectSortOption(SortSelectOptions.PriceAsc);
  await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.unionStationAtriumScreen);
  await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.harbourfrontPierScreen);
  await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.downtownDigitalBoard);
  await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.harbourfrontMarketScreen);
});

test('Browse Price Desc', async ({ browsePage }) => {
  await browsePage.goto();
  await browsePage.selectSortOption(SortSelectOptions.PriceDesc);
  await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.calgaryStadiumDigital);
  await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.icePlazaOutdoorScreen);
  await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.highway401MegaScreen);
  await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.iceDistrictMegaScreen);
});


test('Browse Impressions Desc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.ImpressionsDesc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.calgaryStadiumDigital);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.icePlazaOutdoorScreen);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.iceDistrictArenaBoard);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.iceDistrictMegaScreen);
});

test('Browse Loop Asc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.LoopAsc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.iceDistrictArenaBoard);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.eatonCentreLEDWall);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.unionStationAtriumScreen);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.eatonCentreLEDWall);
});

test('Browse Loop Desc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.LoopDesc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.highway401MegaScreen);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.calgaryStadiumDigital);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.icePlazaOutdoorScreen);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.montrealDowntownWrap);
});