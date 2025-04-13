// @ts-check
const { test, expect } = require('@playwright/test');

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
  const accountButton = page.getByRole('button', { name: 'CS 4218 TEST ACCOUNT' });
  await expect(accountButton).toBeVisible({ timeout: 5000 });
  await accountButton.click();

  const logoutLink = page.getByRole('link', { name: 'Logout' });
  await expect(logoutLink).toBeVisible({ timeout: 5000 });
  await logoutLink.click();
});


test('should show "No orders found" when there are no orders', async ({ page }) => {
  await page.getByRole('button', { name: 'CS 4218 TEST ACCOUNT' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();

  // Assertion: check if the empty state message is visible
  await expect(page.getByTestId('no-orders')).toBeVisible();
  await expect(page.getByTestId('no-orders')).toHaveText('No orders found.');
});
