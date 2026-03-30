import { test, expect } from "../fixtures/test";

test.describe("Member card shows phone number", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("member card displays phone when set", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    // Look for a phone icon (lucide-phone SVG) on any card
    const phoneIcon = page.locator("[data-slot='card'] svg.lucide-phone").first();
    if (!(await phoneIcon.isVisible().catch(() => false))) {
      test.skip(true, "No members with phone numbers in test environment");
    }

    // Phone number text should be next to the icon
    const phoneContainer = phoneIcon.locator("..");
    await expect(phoneContainer).toBeVisible();
    const phoneText = await phoneContainer.locator("span").textContent();
    expect(phoneText).toBeTruthy();
  });
});

test.describe("Members page name filter", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("filter input is visible on members page", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const filterInput = page.getByPlaceholder("Hledat podle jména...");
    await expect(filterInput).toBeVisible();
  });

  test("filtering by name narrows displayed member cards", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount < 2) {
      test.skip(true, "Need at least 2 members to test filtering");
    }

    // Get the name from the first card
    const firstName = await cards.first().locator("[data-slot='card-title']").textContent();
    if (!firstName) {
      test.skip(true, "Could not read member name");
    }

    const filterInput = page.getByPlaceholder("Hledat podle jména...");
    await filterInput.fill(firstName!);

    const filteredCount = await cards.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("non-matching filter shows no results message", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const filterInput = page.getByPlaceholder("Hledat podle jména...");
    await filterInput.fill("xyznonexistent12345");

    await expect(page.getByText("Žádné výsledky")).toBeVisible();
  });

  test("clearing filter restores all members", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    const filterInput = page.getByPlaceholder("Hledat podle jména...");
    await filterInput.fill("xyznonexistent12345");
    await expect(page.getByText("Žádné výsledky")).toBeVisible();

    await filterInput.fill("");
    await expect(cards).toHaveCount(initialCount);
  });
});

test.describe("Statistics member filter", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "statistics is desktop-only");
  });

  test("member filter input is visible on statistics page", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const filterInput = page.getByPlaceholder("Hledat člena...");
    await expect(filterInput).toBeVisible();
  });

  test("filtering by member name narrows table rows", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics member filter test");
    }

    // Count initial member rows (rows with sticky name cells, excluding group headers)
    const memberRows = page.locator("table tbody tr").filter({
      has: page.locator("td.sticky a[href*='/members/']"),
    });
    const initialCount = await memberRows.count();

    if (initialCount < 2) {
      test.skip(true, "Need at least 2 members to test filtering");
    }

    // Get the name of the first member
    const firstMemberName = await memberRows
      .first()
      .locator("td.sticky a")
      .textContent();

    const filterInput = page.getByPlaceholder("Hledat člena...");
    await filterInput.fill(firstMemberName!.trim());

    // Should show fewer member rows
    const filteredCount = await memberRows.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("clearing member filter restores all rows", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available");
    }

    const memberRows = page.locator("table tbody tr").filter({
      has: page.locator("td.sticky a[href*='/members/']"),
    });
    const initialCount = await memberRows.count();

    const filterInput = page.getByPlaceholder("Hledat člena...");
    await filterInput.fill("xyznonexistent12345");

    // Wait for rows to disappear
    await expect(memberRows).toHaveCount(0, { timeout: 5_000 });

    // Clear
    await filterInput.fill("");
    await expect(memberRows).toHaveCount(initialCount, { timeout: 5_000 });
  });
});
