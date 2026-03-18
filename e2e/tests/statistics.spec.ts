import { test, expect } from "../fixtures/test";

test.describe("Statistics page (admin, desktop)", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "statistics is desktop-only");
  });

  test("statistics link visible in sidebar", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const statsLink = page.getByRole("link", { name: "Statistiky" });
    await expect(statsLink).toBeVisible();
  });

  test("statistics page loads with heading and filters", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Statistiky" })).toBeVisible();

    // Date filter controls should be present
    await expect(page.getByLabel("Od")).toBeVisible();
    await expect(page.getByLabel("Do")).toBeVisible();
  });

  test("statistics page shows table or no-data message", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    // Either table or "no data" message should be visible
    const table = page.locator("table");
    const noData = page.getByText("Žádná data pro zvolené období.");

    await expect(table.or(noData)).toBeVisible({ timeout: 10_000 });
  });

  test("statistics table has frozen first column", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics table test");
    }

    // First column should have sticky positioning
    const stickyCell = page.locator("td.sticky.left-0").first();
    await expect(stickyCell).toBeVisible();
  });
});

test.describe("Statistics page (mobile member)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "testing mobile nav only");
  });

  test("statistics link NOT visible in mobile nav", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const bottomNav = page.locator("nav.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();

    // "Statistiky" should not be in mobile nav
    const statsLink = bottomNav.getByRole("link", { name: "Štatistiky" });
    await expect(statsLink).not.toBeVisible();
  });
});
