import { test } from "../../fixtures/basePages";
import { SortSelectOptions, TestMediaTitles } from "../../support/page-object/pages/browse.page";

test.use({
    permissions: [],
});

test('Browse No Location', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.lolaSalonMainLobby);
});


test('Browse Price Asc', async ({ browsePage }) => {
  await browsePage.goto();
  await browsePage.selectSortOption(SortSelectOptions.PriceAsc);
  await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.lolaSalonMainLobby);
  await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.entrepotEnFolieMainEntrance);
  await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.pingMoStoreEntrance);
  await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.studentLounge2);
});

test('Browse Price Desc', async ({ browsePage }) => {
  await browsePage.goto();
  await browsePage.selectSortOption(SortSelectOptions.PriceDesc);
  await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.gymHallwayDigitalBoard);
  await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.mainEntranceDigitalBoard);
  await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.studentLounge1);
  await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.studentLounge2);
});

test('Browse Impressions Asc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.ImpressionsAsc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.lolaSalonMainLobby);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.gymHallwayDigitalBoard);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.mainEntranceDigitalBoard);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.studentLounge1);
});

test('Browse Impressions Desc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.ImpressionsDesc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.entrepotEnFolieMainEntrance);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.pingMoStoreEntrance);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.gymHallwayDigitalBoard);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.mainEntranceDigitalBoard);
});

test('Browse Loop Asc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.LoopAsc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.gymHallwayDigitalBoard);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.mainEntranceDigitalBoard);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.studentLounge1);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.lolaSalonMainLobby);
});

test('Browse Loop Desc', async ({ browsePage }) => {
    await browsePage.goto();
    await browsePage.selectSortOption(SortSelectOptions.LoopDesc);
    await browsePage.assertMediaCardElementToContainText('Title0', TestMediaTitles.pingMoStoreEntrance);
    await browsePage.assertMediaCardElementToContainText('Title1', TestMediaTitles.entrepotEnFolieMainEntrance);
    await browsePage.assertMediaCardElementToContainText('Title2', TestMediaTitles.studentLounge1);
    await browsePage.assertMediaCardElementToContainText('Title3', TestMediaTitles.studentLounge2);
});