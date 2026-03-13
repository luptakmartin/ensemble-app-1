import { test, expect } from "../fixtures/test";

test.describe("Sidebar navigation (desktop)", () => {
  test("navigates to events", async ({ page, nav }) => {
    await page.goto("/cs/profile");
    await nav.eventsLink.first().click();
    await expect(page).toHaveURL(/\/cs\/events/);
  });

  test("navigates to compositions", async ({ page, nav }) => {
    await page.goto("/cs/events");
    await nav.compositionsLink.first().click();
    await expect(page).toHaveURL(/\/cs\/compositions/);
  });

  test("navigates to profile", async ({ page, nav }) => {
    await page.goto("/cs/events");
    await nav.profileLink.first().click();
    await expect(page).toHaveURL(/\/cs\/profile/);
  });

  test("admin sees members link", async ({ page, nav }) => {
    await page.goto("/cs/events");
    await expect(nav.membersLink.first()).toBeVisible();
  });
});

test.describe("Mobile navigation", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    storageState: "./e2e/.auth/member.json",
  });

  test("shows bottom nav on mobile", async ({ page }) => {
    await page.goto("/cs/events");
    const bottomNav = page.locator("nav.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();
  });

  test("navigates via bottom nav", async ({ page }) => {
    await page.goto("/cs/events");
    await page
      .locator("nav.fixed.bottom-0")
      .getByRole("link", { name: "Profil" })
      .click();
    await expect(page).toHaveURL(/\/cs\/profile/);
  });
});
