import { test, expect } from "../fixtures/test";

test.describe("Event type 'Other' in create form", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("'Other' event type is available in the create event form", async ({ page }) => {
    await page.goto("/cs/events/new");
    await page.waitForLoadState("networkidle");

    // Open the event type select
    const typeSelect = page.getByRole("combobox");
    await typeSelect.click();

    // "Jiné" (Other in Czech) should be available
    await expect(page.getByRole("option", { name: "Jiné" })).toBeVisible();
  });

  test("'Other' event type is available in the edit event form", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    // Find an event edit link
    const editLink = page.locator("a[href*='/events/'][href*='/edit']").first();
    if (!(await editLink.isVisible().catch(() => false))) {
      test.skip(true, "No editable events in test environment");
    }
    await editLink.click();
    await page.waitForLoadState("networkidle");

    // Open the event type select
    const typeSelect = page.getByRole("combobox");
    await typeSelect.click();

    // "Jiné" (Other in Czech) should be available
    await expect(page.getByRole("option", { name: "Jiné" })).toBeVisible();
  });
});
