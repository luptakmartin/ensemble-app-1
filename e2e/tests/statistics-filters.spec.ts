import { test, expect } from "../fixtures/test";

test.describe("Statistics date and type filters", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "statistics is desktop-only");
  });

  test("date from filter excludes older events", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    // Wait for table or no-data
    const table = page.locator("table");
    const noData = page.getByText("Žádná data pro zvolené období.");
    await expect(table.or(noData)).toBeVisible({ timeout: 10_000 });

    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics filter test");
    }

    // Count initial columns (events)
    const initialColumns = await page.locator("table thead th").count();

    // Set "From" to a far-future date so no events match
    const fromInput = page.getByLabel("Od");
    await fromInput.fill("2099-01-01");

    // Wait for refetch — table should disappear, showing no data
    await expect(noData).toBeVisible({ timeout: 10_000 });

    // Reset to a very old date to show all events again
    await fromInput.fill("2000-01-01");
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Should have at least as many columns as before
    const afterColumns = await page.locator("table thead th").count();
    expect(afterColumns).toBeGreaterThanOrEqual(initialColumns);
  });

  test("date to filter excludes future events", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    const noData = page.getByText("Žádná data pro zvolené období.");
    await expect(table.or(noData)).toBeVisible({ timeout: 10_000 });

    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics filter test");
    }

    // Set "To" to a very old date so no events match
    const toInput = page.getByLabel("Do");
    await toInput.fill("2000-01-01");

    await expect(noData).toBeVisible({ timeout: 10_000 });

    // Clear the "To" field to restore
    await toInput.fill("");
    await expect(table).toBeVisible({ timeout: 10_000 });
  });

  test("event type filter is visible with all types option", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    // Event type select should be present
    const typeLabel = page.getByLabel("Typ události");
    await expect(typeLabel).toBeVisible();

    // Open the dropdown
    await typeLabel.click();

    // Should show "Všechny typy" and known event types
    await expect(page.getByRole("option", { name: "Všechny typy" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Pravidelná zkouška" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Koncert" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Jiné" })).toBeVisible();
  });

  test("event type filter filters the table", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    const noData = page.getByText("Žádná data pro zvolené období.");
    await expect(table.or(noData)).toBeVisible({ timeout: 10_000 });

    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics type filter test");
    }

    const initialColumns = await page.locator("table thead th").count();

    // Select a specific type that likely has fewer events
    const typeSelect = page.getByLabel("Typ události");
    await typeSelect.click();
    await page.getByRole("option", { name: "Koncert" }).click();

    // Wait for refetch
    await page.waitForLoadState("networkidle");

    // Either fewer columns or no data
    const afterTable = page.locator("table");
    const afterNoData = page.getByText("Žádná data pro zvolené období.");
    await expect(afterTable.or(afterNoData)).toBeVisible({ timeout: 10_000 });

    if (await afterTable.isVisible().catch(() => false)) {
      const afterColumns = await page.locator("table thead th").count();
      expect(afterColumns).toBeLessThanOrEqual(initialColumns);
    }

    // Reset to "all"
    await page.getByLabel("Typ události").click();
    await page.getByRole("option", { name: "Všechny typy" }).click();
    await expect(table).toBeVisible({ timeout: 10_000 });
  });
});
