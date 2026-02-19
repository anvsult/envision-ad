import { Page, expect } from '@playwright/test';

import { isMobileView } from '../../utils/viewUtils';

interface CreateLocationInput {
    name: string;
    street: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
}

interface UpdateLocationInput {
    name?: string;
    street?: string;
    city?: string;
    province?: string;
    country?: string;
    postalCode?: string;
}

interface FillMediaFormInput {
    title: string;
    displayType: 'Digital' | 'Poster';
    weeklyPrice: string;
    dailyImpressions: string;
    loopDuration?: string;
    resolutionWidth?: string;
    resolutionHeight?: string;
    aspectRatioWidth?: string;
    aspectRatioHeight?: string;
    widthCm?: string;
    heightCm?: string;
}

interface EditFormAssertionInput {
    title: string;
    displayType: string;
    weeklyPrice: string;
    dailyImpressions: string;
    loopDuration?: string;
    resolutionWidth?: string;
    resolutionHeight?: string;
    aspectRatioWidth?: string;
    aspectRatioHeight?: string;
    widthCm?: string;
    heightCm?: string;
}

export default class MediaDashboardPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    sidebarToggle = () => this.page.getByLabel('Toggle navigation');
    dashboardButton = () => this.page.getByText('Dashboard').filter({ visible: true });
    mediaOwnerAccordion = () => this.page.getByRole('button', { name: 'Media Owner' });
    mediaLink = () => this.page.getByRole('link', { name: 'Media', exact: true });
    createLocationButton = () => this.page.getByRole('button', { name: 'Create Location' });
    locationNameInput = () => this.page.getByLabel('Name');
    locationStreetInput = () => this.page.getByLabel('Street');
    locationCityInput = () => this.page.getByLabel('City');
    locationProvinceInput = () => this.page.getByLabel('Province/State');
    locationCountryInput = () => this.page.getByLabel('Country');
    locationPostalCodeInput = () => this.page.getByLabel('Postal Code');
    locationCreateButton = () => this.page.getByRole('button', { name: 'Create', exact: true });
    locationModalTitle = () => this.page.getByText('Create Media Location');
    editLocationModalTitle = () => this.page.getByText('Edit Media Location');
    editLocationDialog = () => this.page.getByRole('dialog').filter({ hasText: 'Edit Media Location' });
    editLocationSaveButton = () => this.editLocationDialog().getByRole('button', { name: /^Save$/i });
    deleteLocationDialog = () => this.page.getByRole('dialog').filter({ hasText: 'Delete Location' });
    deleteLocationConfirmButton = () => this.deleteLocationDialog().getByRole('button', { name: /^Delete$/i });

    async clickMediaLink() {
        const mobile = await isMobileView(this.page);

        // On mobile, navigation is inside the drawer
        if (mobile) {
            if (!(await this.dashboardButton().isVisible())) {
                const toggle = this.sidebarToggle();
                await toggle.waitFor({ state: 'visible' });
                await toggle.click();
            }

            if (!(await this.mediaOwnerAccordion().isVisible())) {
                await this.dashboardButton().click();
            }
        }

        // Wait for the accordion to be interactable
        await this.mediaOwnerAccordion().waitFor();

        // Ensure Media Owner accordion is expanded
        if (!(await this.mediaLink().isVisible())) {
            await this.mediaOwnerAccordion().click();
        }

        await this.mediaLink().click();
    }

    private escapeRegex(value: string) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async createLocation(input: CreateLocationInput) {
        await this.createLocationButton().click();
        await expect(this.locationModalTitle()).toBeVisible({ timeout: 10000 });

        await this.locationNameInput().fill(input.name);
        await this.locationStreetInput().fill(input.street);
        await this.locationCityInput().fill(input.city);
        await this.locationProvinceInput().fill(input.province);
        await this.locationCountryInput().fill(input.country);
        await this.locationPostalCodeInput().fill(input.postalCode);

        await this.locationCreateButton().click();
        await expect(this.locationModalTitle()).toBeHidden({ timeout: 10000 });
    }

    async assertLocationVisible(locationName: string) {
        const locationButton = this.page.getByRole('button', {
            name: new RegExp(this.escapeRegex(locationName)),
        }).first();
        await expect(locationButton).toBeVisible({ timeout: 10000 });
    }

    async assertLocationNotVisible(locationName: string) {
        await expect(
            this.page.getByRole('button', {
                name: new RegExp(this.escapeRegex(locationName)),
            })
        ).toHaveCount(0);
    }

    private locationAccordionItem(locationName: string) {
        return this.page
            .getByRole('button', { name: new RegExp(this.escapeRegex(locationName)) })
            .first()
            .locator(
                'xpath=ancestor::*[@data-accordion-item or contains(@class, "mantine-Accordion-item")]'
            )
            .first();
    }

    async ensureLocationExpanded(locationName: string) {
        const locationButton = this.page.getByRole('button', {
            name: new RegExp(this.escapeRegex(locationName)),
        }).first();
        await expect(locationButton).toBeVisible({ timeout: 10000 });
        await locationButton.scrollIntoViewIfNeeded();

        if ((await locationButton.getAttribute('aria-expanded')) !== 'true') {
            await locationButton.click();
        }
    }

    async openAddMediaModalForLocation(locationName: string) {
        await this.ensureLocationExpanded(locationName);
        const locationItem = this.locationAccordionItem(locationName);

        const addMediaButton = locationItem.getByRole('button', { name: /Add Media/i }).first();
        await expect(addMediaButton).toBeVisible({ timeout: 10000 });
        await addMediaButton.click();

        await expect(this.modalTitleInput()).toBeVisible({ timeout: 10000 });
    }

    async openEditLocationModal(locationName: string) {
        const locationItem = this.locationAccordionItem(locationName);
        const editButton = locationItem.getByRole('button', { name: /^Edit$/i }).first();
        await expect(editButton).toBeVisible({ timeout: 10000 });
        await editButton.click();
        await expect(this.editLocationModalTitle()).toBeVisible({ timeout: 10000 });
    }

    async updateLocation(locationName: string, input: UpdateLocationInput) {
        await this.openEditLocationModal(locationName);

        const dialog = this.editLocationDialog();
        if (input.name !== undefined) {
            await dialog.getByLabel('Name').fill(input.name);
        }
        if (input.street !== undefined) {
            await dialog.getByLabel('Street').fill(input.street);
        }
        if (input.city !== undefined) {
            await dialog.getByLabel('City').fill(input.city);
        }
        if (input.province !== undefined) {
            await dialog.getByLabel('Province/State').fill(input.province);
        }
        if (input.country !== undefined) {
            await dialog.getByLabel('Country').fill(input.country);
        }
        if (input.postalCode !== undefined) {
            await dialog.getByLabel('Postal Code').fill(input.postalCode);
        }

        await this.editLocationSaveButton().click();
        await expect(this.editLocationModalTitle()).toBeHidden({ timeout: 10000 });
    }

    async deleteLocation(locationName: string) {
        const locationItem = this.locationAccordionItem(locationName);
        const deleteButton = locationItem.locator('button').last();
        await expect(deleteButton).toBeVisible({ timeout: 10000 });
        await deleteButton.click();

        await expect(this.deleteLocationDialog()).toBeVisible({ timeout: 10000 });
        await this.deleteLocationConfirmButton().click();
        await expect(this.deleteLocationDialog()).toBeHidden({ timeout: 10000 });
    }

    // Separate locators for clearer debugging and less strict-mode collision
    tableRow = (name: string) => this.page.locator('tr').filter({ hasText: name });
    mobileCard = (name: string) => this.page.locator('.mantine-Card-root, div[style*="border"], div[class*="Card"]').filter({ hasText: name });

    // Robust locator: Find the text first, then find its container (row or card)
    mediaItem = (name: string) => this.page.getByText(name).locator('xpath=ancestor::tr | ancestor::div[contains(@class, "mantine-Card-root")]').first();

    mediaActionMenu = (mediaName: string) => this.mediaItem(mediaName).getByLabel('Open media actions');

    async openMediaActions(name: string) {
        const item = this.mediaItem(name);
        await item.scrollIntoViewIfNeeded();
        await item.waitFor();

        const tagName = await item.evaluate((el: Element) => el.tagName);
        if (tagName === 'TR') {
            await item.hover();
        }

        const actionBtn = item.getByLabel('Open media actions');
        await actionBtn.waitFor({ state: 'visible' });

        await expect(async () => {
            await actionBtn.click({ force: true });
            await expect(this.page.getByRole('menuitem').first()).toBeVisible({ timeout: 2000 });
        }).toPass({ timeout: 10000 });
    }

    async openEditForMedia(name: string) {
        await this.openMediaActions(name);
        await this.editMenuItem().click();
        await expect(this.modalTitleInput()).toBeVisible({ timeout: 10000 });
    }

    async deleteMedia(name: string) {
        await this.openMediaActions(name);
        await this.page.getByRole('menuitem', { name: /delete/i }).first().click();
    }

    async assertMediaVisible(name: string) {
        await expect(this.mediaItem(name)).toBeVisible({ timeout: 10000 });
    }

    async assertMediaNotVisible(name: string) {
        const item = this.mediaItem(name);
        const count = await item.count();
        if (count === 0) {
            return;
        }
        await expect(item.first()).not.toBeVisible();
    }

    addMediaButton = () => this.page.getByRole('button', { name: 'Add new media' });

    // Modal Locators
    modalTitleInput = () => this.page.getByRole('textbox', { name: 'Media Name' });
    modalDisplayTypeSelect = () => this.page.getByRole('textbox', { name: 'Type of display' });
    modalPriceInput = () => this.page.getByLabel('Price (per week)');
    modalImpressionsInput = () => this.page.getByLabel('Daily impressions');
    modalLoopDurationInput = () => this.page.getByPlaceholder('Ex. 12');

    // Resolution split inputs
    modalResolutionWidthInput = () => this.page.getByLabel('Resolution - Width (px)');
    modalResolutionHeightInput = () => this.page.getByLabel('Resolution - Height (px)');

    // Aspect Ratio split inputs
    modalAspectRatioWidthInput = () => this.page.getByLabel('Aspect ratio - Width');
    modalAspectRatioHeightInput = () => this.page.getByLabel('Aspect ratio - Height');

    // Poster dimensions
    modalWidthInput = () => this.page.getByLabel('Width (cm)');
    modalHeightInput = () => this.page.getByLabel('Height (cm)');

    modalFileInput = () => this.page.locator('input[type="file"]');

    // Schedule Locators (simplified for now, asserting they exist or interacting if needed)
    // For this test, we might rely on defaults or simple interaction if required.

    saveButton = () => this.page.locator('[role="dialog"]').getByRole('button', { name: /^Save$/i }).first();
    cancelButton = () => this.page.locator('[role="dialog"]').getByRole('button', { name: /^Cancel$/i }).first();

    editMenuItem = () => this.page.getByRole('menuitem', { name: 'Edit' });

    async fillMediaForm(input: FillMediaFormInput) {
        await this.modalTitleInput().fill(input.title);
        const currentDisplayType = (await this.modalDisplayTypeSelect().inputValue())
            .trim()
            .toLowerCase();

        if (currentDisplayType !== input.displayType.toLowerCase()) {
            await this.modalDisplayTypeSelect().click();
            await this.page
                .getByRole('option', { name: new RegExp(`^${input.displayType}$`, 'i') })
                .click();
        }

        if (input.displayType === 'Digital') {
            if (input.loopDuration) {
                await this.modalLoopDurationInput().fill(input.loopDuration);
            }
            if (input.resolutionWidth) {
                await this.modalResolutionWidthInput().fill(input.resolutionWidth);
            }
            if (input.resolutionHeight) {
                await this.modalResolutionHeightInput().fill(input.resolutionHeight);
            }
            if (input.aspectRatioWidth) {
                await this.modalAspectRatioWidthInput().fill(input.aspectRatioWidth);
            }
            if (input.aspectRatioHeight) {
                await this.modalAspectRatioHeightInput().fill(input.aspectRatioHeight);
            }
        } else {
            if (input.widthCm) {
                await this.modalWidthInput().fill(input.widthCm);
            }
            if (input.heightCm) {
                await this.modalHeightInput().fill(input.heightCm);
            }
        }

        await this.modalPriceInput().fill(input.weeklyPrice);
        await this.modalImpressionsInput().fill(input.dailyImpressions);
    }

    async setSingleDaySchedule(day: string, start: string, end: string) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const currentDay of days) {
            const checkbox = this.page.getByRole('checkbox', { name: currentDay });
            if (currentDay === day) {
                await checkbox.check();
            } else if (await checkbox.isChecked()) {
                await checkbox.uncheck();
            }
        }

        const enabledTimeInputs = this.page.locator('input[placeholder="00:00"]:not([disabled])');
        await enabledTimeInputs.first().fill(start);
        await enabledTimeInputs.nth(1).fill(end);
    }

    async uploadMediaImage(filePath: string) {
        const uploadButton = this.page.getByText(/Upload File|Change File/i).first();
        await uploadButton.click();

        const cloudinaryFrame = this.page.frameLocator('iframe[src*="cloudinary"]');
        await cloudinaryFrame.locator('input[type="file"]').first().setInputFiles(filePath);

        const cropButton = cloudinaryFrame.getByRole('button', { name: /crop|done|apply/i }).first();
        if ((await cropButton.count()) > 0) {
            await cropButton.click().catch(() => undefined);
        }

        // Wait until the upload callback updates the modal state and preview section is rendered.
        await expect(this.page.getByText('Preview & Set Corners')).toBeVisible({ timeout: 20000 });
        await expect(this.page.getByText(/Change File/i).first()).toBeVisible({ timeout: 20000 });
    }

    async setPreviewCornersIfVisible() {
        const previewHeading = this.page.getByText('Preview & Set Corners');
        const isPreviewVisible = await previewHeading
            .isVisible({ timeout: 20000 })
            .catch(() => false);
        if (!isPreviewVisible) {
            return;
        }

        const handles = this.page.locator('svg circle');
        await expect(handles.first()).toBeVisible({ timeout: 10000 });

        const firstHandle = handles.first();
        const box = await firstHandle.boundingBox();
        if (!box) {
            return;
        }

        await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await this.page.mouse.down();
        await this.page.mouse.move(box.x + box.width / 2 + 20, box.y + box.height / 2 + 20);
        await this.page.mouse.up();
    }

    async submitMediaForm() {
        // Guard save against racing with upload/preview initialization.
        await expect(this.page.getByText('Preview & Set Corners')).toBeVisible({ timeout: 20000 });
        const saveButton = this.saveButton();
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.evaluate((el) => (el as HTMLButtonElement).click());
        await expect(this.modalTitleInput()).toBeHidden({ timeout: 10000 });
    }

    async assertEditFormPrefilled(input: EditFormAssertionInput) {
        await expect(this.modalTitleInput()).toHaveValue(input.title);
        await expect(this.modalDisplayTypeSelect()).toHaveValue(new RegExp(input.displayType, 'i'));
        await expect(this.modalPriceInput()).toHaveValue(input.weeklyPrice);
        await expect(this.modalImpressionsInput()).toHaveValue(input.dailyImpressions);

        if (input.loopDuration !== undefined) {
            await expect(this.modalLoopDurationInput()).toHaveValue(input.loopDuration);
        }
        if (input.resolutionWidth !== undefined) {
            await expect(this.modalResolutionWidthInput()).toHaveValue(input.resolutionWidth);
        }
        if (input.resolutionHeight !== undefined) {
            await expect(this.modalResolutionHeightInput()).toHaveValue(input.resolutionHeight);
        }
        if (input.aspectRatioWidth !== undefined) {
            await expect(this.modalAspectRatioWidthInput()).toHaveValue(input.aspectRatioWidth);
        }
        if (input.aspectRatioHeight !== undefined) {
            await expect(this.modalAspectRatioHeightInput()).toHaveValue(input.aspectRatioHeight);
        }
        if (input.widthCm !== undefined) {
            await expect(this.modalWidthInput()).toHaveValue(input.widthCm);
        }
        if (input.heightCm !== undefined) {
            await expect(this.modalHeightInput()).toHaveValue(input.heightCm);
        }
    }

    // Legacy locators from previous usage (keeping for compatibility if used elsewhere)
    mediaNameInput = () => this.modalTitleInput();
    priceInput = () => this.modalPriceInput();

    // Proxy methods for raw access if needed (optional, but consistent with snippet usage if they don't refactor)
    getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]) {
        return this.page.getByRole(role, options);
    }

    getByText(text: string | RegExp, options?: Parameters<Page['getByText']>[1]) {
        return this.page.getByText(text, options);
    }
}
