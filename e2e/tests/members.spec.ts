import { test, expect } from "../fixtures/test";

test.describe("Members page", () => {
  test("shows members heading", async ({ page }) => {
    await page.goto("/cs/members");
    await expect(
      page.getByRole("heading", { name: "Členové" }),
    ).toBeVisible();
  });

  test("displays member cards", async ({ page }) => {
    await page.goto("/cs/members");
    // Wait for at least one member card to appear
    await expect(page.getByRole("link").filter({ hasText: /@/ })).not.toHaveCount(0);
  });
});
