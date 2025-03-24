import { test, expect } from "@playwright/test";
import { assert } from "console";

test.describe("Test Register", () => {
  test("Should register successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByRole("textbox", { name: "Enter Your Name" }).click();
    await page.getByRole("textbox", { name: "Enter Your Name" }).fill("xavier");
    await page.getByRole("textbox", { name: "Enter Your Name" }).press("Tab");
    var id = "id" + Math.random().toString(16).slice(2);

    let randomEmail = `xavier${id}.test@test.com`;
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(randomEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testing123");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .press("Tab");
    var randomNumber = Math.random().toString(16);

    await page
      .getByRole("textbox", { name: "Enter Your Phone" })
      .fill(randomNumber);
    await page.getByRole("textbox", { name: "Enter Your Phone" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Address" })
      .fill("test add");
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .click();
    await page
      .getByRole("textbox", { name: "What is Your Favorite sports" })
      .fill("some random sport");
    await page.getByPlaceholder("Enter Your DOB").fill("2025-03-03");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page.getByRole("button", { name: "REGISTER" }).click();
    await expect(page).toHaveURL("/login");
  });
});
test.describe("Test Login", () => {
  test("Should login successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("xavier.test@test.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testing123");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("/");
  });

  test("Should fail to login with wrong password", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("xavier.test@test.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("wrongPassword");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await expect(page).toHaveURL("/login");
  });
});
