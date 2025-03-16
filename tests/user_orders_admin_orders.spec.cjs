// @ts-check
const { test, expect } = require('@playwright/test');

test.describe.serial('Admin Orders page', () => {
  test('should show orders in admin orders after user makes payment', async ({ page }) => {
    //Login
    await page.goto('/', {waitUntil: "domcontentloaded"});
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('mayuanxin@u.nus.edu');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Paying with Card' }).click();
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).click();
    await page.locator('iframe[name="braintree-hosted-field-number"]').contentFrame().getByRole('textbox', { name: 'Credit Card Number' }).fill('371449635398431');
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).click();
    await page.locator('iframe[name="braintree-hosted-field-expirationDate"]').contentFrame().getByRole('textbox', { name: 'Expiration Date' }).fill('1230');
    await page.getByRole('button', { name: 'Make Payment' }).click();
    await expect(page.getByRole('main')).toContainText('few seconds agoSuccess1NovelA bestselling novelPrice: 14.99');
    await page.getByRole('button', { name: 'Yuanxin' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    //Login as admin
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@admin.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
    await page.getByRole('button', { name: 'LOGIN' }).click({ force: true });
    await page.getByRole('button', { name: 'MyAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('main')).toContainText('few seconds agoSuccess1NovelA bestselling novelPrice :');

  });

  test('should show changed order status in user orders page', async ({ page }) => {
    //Login
  await page.goto('/', {waitUntil: "domcontentloaded"});
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@admin.com');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
  await page.getByRole('button', { name: 'LOGIN' }).click({ force: true });
  await page.getByRole('button', { name: 'MyAdmin' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
  await page.getByRole('row', { name: 'Not Process Yuanxin' }).locator('span').nth(1).click();
  await page.getByTitle('Processing').locator('div').click();
  await expect(page.getByRole('main')).toContainText('Processing');
  await page.getByRole('button', { name: 'MyAdmin' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  //Login as user
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('mayuanxin@u.nus.edu');
  await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
  await page.getByRole('button', { name: 'LOGIN' }).click({ force: true });
  await page.getByRole('button', { name: 'Yuanxin' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Orders' }).click();
  await expect(page.getByRole('main')).toContainText('Processing');

  });



})
