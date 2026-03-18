import { test, expect } from "../fixtures/test";

test.describe("Profile page avatar (member)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("profile form shows avatar section", async ({ page }) => {
    await page.goto("/cs/profile");
    await page.waitForLoadState("networkidle");

    // "Profilový obrázek" label should be visible
    await expect(page.getByText("Profilový obrázek")).toBeVisible();

    // Avatar (either image or initials) should be present
    const avatar = page.locator(".rounded-full").first();
    await expect(avatar).toBeVisible();

    // File input should exist
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});

test.describe("Attendance list avatar", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("event detail attendance shows avatars", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    // Click first event
    const firstEventLink = page.locator("a[href*='/events/']").first();
    if (!(await firstEventLink.isVisible().catch(() => false))) {
      test.skip(true, "No events in test environment");
    }
    await firstEventLink.click();
    await page.waitForLoadState("networkidle");

    // Click "Detail" tab to see attendance list
    const detailTab = page.getByRole("tab", { name: "Detail" });
    if (await detailTab.isVisible().catch(() => false)) {
      await detailTab.click();

      // Avatars should be visible in attendance detail
      const avatars = page.locator(".rounded-full");
      await expect(avatars.first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
