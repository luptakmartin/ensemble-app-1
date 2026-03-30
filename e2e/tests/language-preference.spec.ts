import { test, expect } from "../fixtures/test";

test.describe("Language preference on profile page", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("profile page shows language select", async ({ page }) => {
    await page.goto("/cs/profile");
    await page.waitForLoadState("networkidle");

    const languageLabel = page.getByText("Jazyk");
    await expect(languageLabel).toBeVisible();

    // Should show language select with current value
    const languageSelect = page.locator("button[role='combobox']").filter({ hasText: /Čeština|Slovenčina|English/ });
    await expect(languageSelect).toBeVisible();
  });

  test("language select shows all three options", async ({ page }) => {
    await page.goto("/cs/profile");
    await page.waitForLoadState("networkidle");

    // Open the language select
    const languageSelect = page.locator("button[role='combobox']").filter({ hasText: /Čeština|Slovenčina|English/ });
    await languageSelect.click();

    await expect(page.getByRole("option", { name: "Čeština" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Slovenčina" })).toBeVisible();
    await expect(page.getByRole("option", { name: "English" })).toBeVisible();
  });

  test("changing language to English reloads page in English", async ({ page }) => {
    await page.goto("/cs/profile");
    await page.waitForLoadState("networkidle");

    // Open language select and choose English
    const languageSelect = page.locator("button[role='combobox']").filter({ hasText: /Čeština|Slovenčina|English/ });
    await languageSelect.click();
    await page.getByRole("option", { name: "English" }).click();

    // Submit the form
    const saveButton = page.getByRole("button", { name: /Uložit|Save/ });
    await saveButton.click();

    // Should redirect to /en/profile
    await page.waitForURL("**/en/profile**", { timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    // Page should now be in English
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();

    // Restore to Czech
    const enLanguageSelect = page.locator("button[role='combobox']").filter({ hasText: /Čeština|Slovenčina|English/ });
    await enLanguageSelect.click();
    await page.getByRole("option", { name: "Čeština" }).click();
    await page.getByRole("button", { name: /Save|Uložit/ }).click();
    await page.waitForURL("**/cs/profile**", { timeout: 15_000 });
  });
});

test.describe("Admin can set language for a member", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("admin member editor shows language select", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    // Wait for member cards to render
    const memberLink = page.locator("[data-slot='card'] a[href*='/members/']").first();
    await expect(memberLink).toBeVisible({ timeout: 15_000 });
    await memberLink.click();
    await page.waitForLoadState("networkidle");

    // Wait for admin editor heading
    await expect(page.getByText("Upravit člena")).toBeVisible({ timeout: 15_000 });

    // Admin editor section should have a language label and select
    await expect(page.getByText("Jazyk")).toBeVisible();
    const languageSelect = page.locator("button[role='combobox']").filter({ hasText: /Čeština|Slovenčina|English/ });
    await expect(languageSelect).toBeVisible();
  });
});
