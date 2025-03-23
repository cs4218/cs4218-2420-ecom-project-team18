// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('User Profile Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/', {waitUntil: "domcontentloaded"});
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        });
        
    test.afterEach(async ({ page }) => {
        await page.getByRole('button', { name: 'CS 4218 TEST ACCOUNT' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
    });

    test('should allow the user to update profile information', async ({ page }) => {
        await page.getByRole('button', { name: 'CS 4218 TEST ACCOUNT' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();

        // Fill in the form with new data(but actuall old data so as to not mess up the db)
        await page.getByPlaceholder('Enter Your Name').fill('CS 4218 TEST ACCOUNT');
        await page.getByPlaceholder('Enter Your Password (Optional)').fill('cs4218@test.com');
        await page.getByPlaceholder('Enter Your Phone').fill('81234567');
        await page.getByPlaceholder('Enter Your Address').fill('1 Computing Drive');

        // Submit the form
        await page.getByRole('button', { name: 'UPDATE' }).click();

        // Assert that a success toast is shown (if toast has role=alert or similar)
        await expect(page.locator('text=Profile Updated Successfully')).toBeVisible({ timeout: 3000 });

    });
});
