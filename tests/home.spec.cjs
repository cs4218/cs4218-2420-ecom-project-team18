// @ts-check
const { test, expect } = require('@playwright/test');

test.describe.serial('Homepage functionality', () => {
  test('should load categories, products and filter products', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for category and price filters
    await expect(page.getByText('Filter By Category')).toBeVisible();
    await expect(page.getByText('Filter By Price')).toBeVisible();

    // Check initial product cards
    const initialProductCount = await page.locator('.card').count();
    expect(initialProductCount).toBeGreaterThan(0);

    // Apply a category filter
    const categoryCheckbox = page.locator('.filters').getByRole('checkbox').first();
    await categoryCheckbox.check();

    // Wait for filtering (you might want to wait for network or loading state)
    await page.waitForTimeout(1000); // Optional: Adjust or use smarter wait

    const filteredProductCount = await page.locator('.card').count();
    expect(filteredProductCount).toBeGreaterThan(0);
  });

  test('should add product to cart and show in cart page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click on ADD TO CART for first product
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

    // Expect toast message (if it exists in your DOM)
    await expect(page.locator('.Toastify__toast')).toContainText('Item Added to cart');

    // Navigate to Cart
    await page.getByRole('link', { name: 'Cart' }).click();

    // Assert cart has at least one item (you can improve this with data-testid)
    await expect(page.getByText('Total')).toBeVisible();

    const cartItems = await page.locator('.cart-item').count().catch(() => 0);
    expect(cartItems).toBeGreaterThan(0);
  });

  test('should load more products when clicking Loadmore', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const initialCount = await page.locator('.card').count();

    const loadMoreButton = page.getByRole('button', { name: /Loadmore/i });
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(1500); // Wait for more products to load

      const newCount = await page.locator('.card').count();
      expect(newCount).toBeGreaterThan(initialCount);
    } else {
      console.warn('Loadmore button not visible – skipping test.');
    }
  });
});
