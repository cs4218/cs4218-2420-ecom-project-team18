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

test.describe('Category Admin page', () => {
  test('should allow me to create, update and delete category', async ({ page }) => {
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('textbox', { name: 'Enter new category' }).fill('new category');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('new category is created')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter new category' })).toHaveValue('new category');
    await expect(page.locator('tbody')).toContainText('new category');
    await page.getByRole('button', { name: 'Edit' }).nth(3).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
    await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('new category updated');
    await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
    //await expect(page.locator('tbody')).toContainText('new category updated');
    await expect(page.getByText('new category updated is updated')).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).nth(3).click();
    await expect(page.getByText('category is deleted')).toBeVisible();

  });
})
