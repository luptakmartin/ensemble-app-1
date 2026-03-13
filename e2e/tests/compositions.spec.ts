import { test, expect } from "../fixtures/test";

test.describe("Compositions page", () => {
  test("shows compositions heading", async ({ page }) => {
    await page.goto("/cs/compositions");
    await expect(
      page.getByRole("heading", { name: "Skladby" }),
    ).toBeVisible();
  });

  test("admin sees create composition button", async ({ page }) => {
    await page.goto("/cs/compositions");
    await expect(
      page.getByRole("link", { name: "Vytvořit skladbu" }),
    ).toBeVisible();
  });
});

test.describe("Compositions page (member role)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("member does not see create composition button", async ({ page }) => {
    await page.goto("/cs/compositions");
    await expect(
      page.getByRole("heading", { name: "Skladby" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Vytvořit skladbu" }),
    ).not.toBeVisible();
  });
});
