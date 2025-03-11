// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/', {waitUntil: "domcontentloaded"});
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@admin.com');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
  await page.getByRole('button', { name: 'LOGIN' }).click();
});

test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
})

test.describe('Admin Orders page', () => {
  test('should allow me to change status of orders', async ({ page }) => {
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();
    await page.locator('#root').getByTitle('Not Process').click();
    await page.getByTitle('Processing').locator('div').click();
    await expect(page.getByRole('main')).toContainText('Processing');
    await page.locator('#root').getByTitle('Processing').click();
    await page.getByTitle('Not Process').locator('div').click();
    await expect(page.getByRole('main')).toContainText('Not Process');

  });


})
