// @ts-check
const { test, expect } = require('@playwright/test');

test.describe.serial('Filter Products By Category', () => {
  test('should filter products when a category is selected', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Ensure category filter section is visible
    await expect(page.getByText('Filter By Category')).toBeVisible();

    // Get all category checkboxes
    const categoryCheckboxes = page.locator('.filters input[type="checkbox"]');
    const count = await categoryCheckboxes.count();
    expect(count).toBeGreaterThan(0);

    // Click the first category checkbox
    await categoryCheckboxes.nth(0).check();

    // Wait for filtering to apply (you may replace this with smarter wait logic if needed)
    await page.waitForTimeout(1000);

    // Check that filtered products are displayed
    const filteredProducts = page.locator('.card');
    const filteredCount = await filteredProducts.count();
    expect(filteredCount).toBeGreaterThan(0);

    // Optionally: log product names for visibility
    for (let i = 0; i < filteredCount; i++) {
      const name = await filteredProducts.nth(i).locator('.card-title').first().innerText();
      console.log(`Filtered Product #${i + 1}: ${name}`);
    }
  });
});
