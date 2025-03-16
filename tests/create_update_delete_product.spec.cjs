// @ts-check
const { test, expect } = require('@playwright/test');


const generateName = () => {
    let name = '';
    while (name.length < 20) {
        name += Math.random().toString(36).substring(2);
    }
    return name.substring(0, 20);
  }
let currName;
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

test.describe.serial('Product Admin page', () => {
  test('should allow me to create product', async ({ page }) => {
    currName = generateName();
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Product' }).click();
    await page.locator('#rc_select_0').click();
    await page.getByTitle('h', { exact: true }).locator('div').click();
    await page.getByText('Upload Photo').click();
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill(currName);
    await page.getByRole('textbox', { name: 'write a name' }).press('Tab');
    await page.getByRole('textbox', { name: 'write a description' }).fill('product test description');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('10');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('20');
    await page.locator('#rc_select_1').click();
    await page.getByText('Yes').click();
    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByRole('main')).toContainText(currName);
    await expect(page.getByRole('main')).toContainText('product test description');
    await expect(page.locator('h1')).toContainText('All Products List');

  });

  test('should allow me to update product', async ({ page }) => {
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: currName }).click();
    await page.getByTestId('selectCategory').getByTitle('h').click();
    await page.getByTitle('?').locator('div').click();
    await page.getByRole('textbox', { name: 'write a name' }).click();
    await page.getByRole('textbox', { name: 'write a name' }).fill(currName + '-update');
    await page.getByRole('textbox', { name: 'write a description' }).click();
    await page.getByRole('textbox', { name: 'write a description' }).fill('product test description-update');
    await page.getByPlaceholder('write a Price').click();
    await page.getByPlaceholder('write a Price').fill('1');
    await page.getByPlaceholder('write a quantity').click();
    await page.getByPlaceholder('write a quantity').fill('2');
    await page.getByText('Yes').click();
    await page.getByText('No').click();
    await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
    currName = currName + '-update'
    await expect(page.getByRole('main')).toContainText(currName);
    await expect(page.getByRole('main')).toContainText('product test description-update');
    await expect(page.locator('h1')).toContainText('All Products List');
    await page.getByRole('link', { name: currName }).click();
    await expect(page.getByPlaceholder('write a description')).toContainText('product test description-update');
    await expect(page.getByRole('textbox', { name: 'write a name' })).toBeVisible();
    await expect(page.getByPlaceholder('write a Price')).toBeVisible();
    await expect(page.getByPlaceholder('write a quantity')).toBeVisible();
    await expect(page.getByTestId('selectShipping').locator('div')).toContainText('No');

  });

  test('should allow me to delete product', async ({ page }) => {
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Products' }).click();
    await page.getByRole('link', { name: currName}).click();
    await expect(page.getByRole('main')).toContainText('product test description-update');
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    page.once('dialog', dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept('Yes'); 
    });
    await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
    await expect(page.getByText(currName)).toBeHidden();
    await expect(page.getByText('product test description-update')).toBeHidden();

  });
})
