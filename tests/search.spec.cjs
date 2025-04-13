// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search Input Component', () => {
  test('should search "nus" and display "NUS T-shirt"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Search').fill('nus');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
  });

  test('should search "law" and display "The Law of Contract in Singapore"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Search').fill('law');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(
      page.getByRole('heading', { name: 'The Law of Contract in Singapore' })
    ).toBeVisible();
  });

  test('should search "Laptop" and display "Laptop"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Search').fill('Laptop');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
  });

  test('should search "testnothing" and show "No Products Found"', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Search').fill('testnothing');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.locator('text=No Products Found')).toBeVisible();
  });
});
