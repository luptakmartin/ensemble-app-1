import { test, expect } from "../fixtures/test";

const eventCardLink = "a[href*='/events/'][href*='-']";

test.describe("Event detail compositions heading i18n", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("compositions heading is translated to Czech", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator(eventCardLink).first();
    if (!(await firstLink.isVisible().catch(() => false))) {
      test.skip(true, "No events in test environment");
    }
    await firstLink.click();
    await page.waitForLoadState("networkidle");

    // Should show "Skladby" (Czech), not "Compositions"
    await expect(page.getByRole("heading", { name: "Skladby", level: 3 }).or(
      page.locator("h3").filter({ hasText: "Skladby" })
    )).toBeVisible();

    // Should NOT show the English "Compositions" anywhere as a heading
    const englishHeading = page.locator("h3").filter({ hasText: /^Compositions$/ });
    await expect(englishHeading).not.toBeVisible();
  });
});
