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

    const browserName = test.info().project.name;
   
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();

    if (browserName === 'chromium') {
      await page.getByRole('row', { name: 'Not Process CS 4218 Test Account' }).locator('span').nth(1).click();
      await page.getByTitle('Processing').locator('div').click();
      await expect(page.getByRole('row', { name: 'Processing CS 4218 Test Account' })).toBeTruthy();
      await page.getByRole('row', { name: 'Processing CS 4218 Test Account' }).locator('span').nth(1).click({force: true});
      await page.getByTitle('Not Process').locator('div').click();
      await expect(page.getByRole('row', { name: 'Not Process CS 4218 Test Account' })).toBeTruthy();
    } else if (browserName === 'firefox') {
      await page.getByRole('row', { name: 'Shipped Test 3' }).locator('span').nth(1).click();
      await page.getByTitle('Delivered').locator('div').click();
      await expect(page.getByRole('main')).toContainText('Delivered');
      await page.locator('#root').getByTitle('Delivered').click();
      await page.getByTitle('Shipped').locator('div').click();
      await expect(page.getByRole('main')).toContainText('Shipped');
    } else if (browserName === 'webkit') {
      await page.getByRole('row', { name: 'Not Process Test 3' }).locator('span').nth(1).click();
      await page.getByTitle('Cancelled').locator('div').click();
      await expect(page.getByRole('main')).toContainText('Cancelled');
      await page.locator('#root').getByTitle('Cancelled').click();
      await page.getByTitle('Not Process').locator('div').click();
      await expect(page.getByRole('main')).toContainText('Not Process');
    }
    

  });


})
