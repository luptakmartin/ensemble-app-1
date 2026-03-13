import { test, expect } from "../fixtures/test";
import { testAccounts } from "../setup/test-accounts";

test.describe("Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/cs/events");
    await expect(page).toHaveURL(/\/cs\/login/);
  });

  test("logs in with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(
      testAccounts.admin.email,
      testAccounts.admin.password,
    );
    await expect(page).toHaveURL(/\/cs\/events/);
  });

  test("shows error for wrong password", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(testAccounts.admin.email, "wrong-password-123");
    await expect(loginPage.errorMessage).toContainText(
      "Nesprávný e-mail nebo heslo",
    );
  });

  test("logs out and returns to login", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "logout button in sidebar, hidden on mobile",
    );

    // First log in
    await page.goto("/cs/login");
    await page.getByLabel("E-mail").fill(testAccounts.admin.email);
    await page.getByLabel("Heslo").fill(testAccounts.admin.password);
    await page.getByRole("button", { name: "Přihlásit se" }).click();
    await expect(page).toHaveURL(/\/cs\/events/);

    // Then log out via sidebar
    await page.getByRole("button", { name: "Odhlásit se" }).click();
    await expect(page).toHaveURL(/\/cs\/login/);
  });
});
