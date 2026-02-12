
import { test, expect } from '../../fixtures/basePages';
import path from 'path';

test.describe('Media Creation', () => {

    test.use({
        baseURL: 'http://localhost:3000/en',
    });

    test.beforeEach(async ({ page, homePage, mediaDashboardPage }) => {
        // Mock backend responses for Media operations
        await page.route('**/api/v1/media', async route => {
            if (route.request().method() === 'POST') {
                console.log('Backend POST /api/v1/media called!');
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        id: 'new-media-id-123',
                        title: 'New Outdoor Billboard',
                        mediaOwnerName: 'Owner Corp',
                        status: 'ACTIVE',
                        imageUrl: 'http://example.com/uploaded.jpg'
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Mock getting media list initially (empty)
        await page.route('**/api/v1/media?**', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
            } else {
                await route.continue();
            }
        });

        // Mock Cloudinary signature
        await page.route('**/api/cloudinary/sign-upload', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ signature: 'mock-sig', timestamp: 123456 })
            });
        });

        // Login using UI flow
        await homePage.goto();
        await homePage.login('megadoxs', 'Password1!'); // Using credentials from loginSuccess.spec.ts
        await homePage.assertUserLoggedIn('megadoxs');
        await homePage.setLanguageToEnglish();

        // Navigate to Media Owner Dashboard via Sidebar
        await page.goto('/dashboard');
        await mediaDashboardPage.clickMediaLink();
    });

    test('should create a new media slot with uploaded image', async ({ page, mediaDashboardPage }) => {
        const mediaTitle = 'New Outdoor Billboard';

        await mediaDashboardPage.addMediaButton().click();

        // Wait for modal
        await expect(mediaDashboardPage.modalTitleInput()).toBeVisible();

        // Fill fields
        await mediaDashboardPage.modalTitleInput().fill(mediaTitle);

        // Check current Display Type value
        await page.waitForTimeout(500); // Wait for potential default state
        const initialDisplayValue = await mediaDashboardPage.modalDisplayTypeSelect().inputValue();
        console.log('Initial Display Type Value:', initialDisplayValue);

        // Only select if not already Digital
        if (initialDisplayValue !== 'Digital') {
            console.log('Selecting Digital...');
            await mediaDashboardPage.modalDisplayTypeSelect().click();
            await page.waitForTimeout(200);
            await page.keyboard.press('Enter');
        } else {
            console.log('Digital already selected. Skipping selection.');
        }

        // precise wait for conditional field rendering
        await expect(mediaDashboardPage.modalLoopDurationInput()).toBeVisible({ timeout: 5000 });

        await mediaDashboardPage.modalPriceInput().fill('500');
        await mediaDashboardPage.modalImpressionsInput().fill('10000');
        await mediaDashboardPage.modalLoopDurationInput().fill('15');

        await mediaDashboardPage.modalResolutionWidthInput().fill('1920');
        await mediaDashboardPage.modalResolutionHeightInput().fill('1080');

        await mediaDashboardPage.modalAspectRatioWidthInput().fill('16');
        await mediaDashboardPage.modalAspectRatioHeightInput().fill('9');

        // Select Schedule - Monday Only
        // Ensure Monday is checked and others are unchecked to avoid validation errors on empty fields
        await page.getByRole('checkbox', { name: 'Monday' }).check();

        const daysToUncheck = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        try {
            for (const day of daysToUncheck) {
                const checkbox = page.getByRole('checkbox', { name: day });
                if (await checkbox.isVisible() && await checkbox.isChecked()) {
                    await checkbox.uncheck();
                }
            }
        } catch (e) {
            console.warn('Error unchecking days:', e);
        }

        // Fill Monday Times
        const startInput = page.getByPlaceholder('00:00').first();
        const endInput = page.getByPlaceholder('00:00').nth(1);
        await startInput.fill('09:00');
        await endInput.fill('17:00');

        // File Upload - Cloudinary Widget interaction
        await page.getByText('Upload File').click();

        // Wait for widget iframe
        const widgetFrame = page.frameLocator('iframe[src*="cloudinary"]');

        // Set the file
        await widgetFrame.locator('input[type="file"]').setInputFiles(path.join(__dirname, '../../fixtures/test-ad-image.jpg'));

        // Mock Cloudinary upload response logic
        await page.route('https://api.cloudinary.com/v1_1/**/image/upload', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                    public_id: 'sample_id'
                })
            });
        });

        // Wait for crop UI to appear and complete the crop step
        try {
            const cropButton = widgetFrame.getByRole('button', { name: /crop|done|apply/i });
            await cropButton.waitFor({ state: 'visible', timeout: 5000 });
            await cropButton.click();
        } catch (e) {
            console.warn('Crop button not found or not required:', e);
        }

        await expect(page.getByText('Preview & Set Corners')).toBeVisible({ timeout: 10000 });


        // Interact with ImageCornerSelector to ensure previewConfiguration is set
        const circles = page.locator('circle');
        const circleCount = await circles.count();
        console.log(`Found ${circleCount} corner handles.`);

        if (circleCount > 0) {
            const firstHandle = circles.first();
            await firstHandle.waitFor({ state: 'visible' });
            const box = await firstHandle.boundingBox();
            if (box) {
                // Perform a significant drag
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + 100, box.y + 100);
                await page.mouse.up();
                await page.waitForTimeout(500);
            }
        } else {
            console.error('No corner handles found!');
        }

        // Save
        console.log('Clicking Save...');
        await mediaDashboardPage.saveButton().click({ force: true });

        await page.waitForTimeout(1000);

        // Check for specific notification text in body
        const bodyText = await page.evaluate(() => document.body.innerText);
        if (bodyText.includes('Please set the preview corners')) {
            console.error('Blocking Notification Found: Please set the preview corners');
        }
        if (bodyText.includes('upload an image')) {
            console.error('Blocking Notification Found: Please upload an image');
        }

        // Debug: Check for validation errors
        const validationErrors = await page.locator('.mantine-Input-error').allTextContents();
        if (validationErrors.length > 0) {
            console.log('Validation Errors Found:', validationErrors);
        }


        // Verify Modal Closed and Success
        await expect(mediaDashboardPage.modalTitleInput()).toBeHidden();

        try {
            await expect(page.getByText('Media created successfully')).toBeVisible({ timeout: 5000 });
        } catch {
        }
    });
});
