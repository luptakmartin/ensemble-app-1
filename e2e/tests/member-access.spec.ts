import { test, expect } from "../fixtures/test";

test.describe("Member role can view members list (read-only)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "sidebar hidden on mobile");
  });

  test("member sees members link in sidebar", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const membersLink = page.getByRole("link", { name: "Členové" });
    await expect(membersLink.first()).toBeVisible();
  });

  test("member can access members page and sees member cards", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Členové" })).toBeVisible();

    // Should see at least one member card
    const cards = page.locator("[data-slot='card']");
    await expect(cards.first()).toBeVisible();
  });

  test("member does not see invite button on members page", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    // "Pozvat člena" (Invite member) button should NOT be visible
    const inviteButton = page.getByText("Pozvat člena");
    await expect(inviteButton).not.toBeVisible();
  });

  test("member can view member detail page without edit controls", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const memberLink = page.locator("[data-slot='card'] a[href*='/members/']").first();
    await expect(memberLink).toBeVisible();
    await memberLink.click();
    await page.waitForLoadState("networkidle");

    // Should see member info (name heading or details)
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Should NOT see "Upravit člena" (Edit member) section
    const editSection = page.getByText("Upravit člena");
    await expect(editSection).not.toBeVisible();

    // Should NOT see role manager
    const roleManager = page.getByText("Role");
    // Role badges are visible but the role manager form should not be
    const roleCheckboxes = page.locator("input[type='checkbox']");
    await expect(roleCheckboxes).toHaveCount(0);
  });
});

test.describe("Member role can view statistics (read-only for others)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "statistics is desktop-only");
  });

  test("member sees statistics link in sidebar", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const statsLink = page.getByRole("link", { name: "Statistiky" });
    await expect(statsLink).toBeVisible();
  });

  test("member can access statistics page", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    // Should NOT be redirected to events
    await expect(page).toHaveURL(/\/statistics/);
    await expect(page.getByRole("heading", { name: "Statistiky" })).toBeVisible();

    // Should show table or no-data message
    const table = page.locator("table");
    const noData = page.getByText("Žádná data pro zvolené období.");
    await expect(table.or(noData)).toBeVisible({ timeout: 10_000 });
  });

  test("member can click a cell in statistics and sees popup", async ({ page }) => {
    await page.goto("/cs/statistics");
    await page.waitForLoadState("networkidle");

    const table = page.locator("table");
    if (!(await table.isVisible().catch(() => false))) {
      test.skip(true, "No data available for statistics table test");
    }

    // Click a data cell (not the sticky name column)
    const dataCell = page.locator("table tbody td:not(.sticky)").first();
    await dataCell.click();

    // A popup with member name and event info should appear
    // The popup contains a font-medium member name and a muted event name
    const popup = page.locator(".bg-popover");
    await expect(popup).toBeVisible({ timeout: 5_000 });
  });
});
