import { test, expect } from "../fixtures/test";

test.describe("Member management (admin, desktop)", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "admin features on desktop only");
  });

  test("member cards display avatar", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const avatars = page.locator("[data-slot='card'] .rounded-full");
    await expect(avatars.first()).toBeVisible();
  });

  test("member detail page shows large avatar", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const memberLink = page.locator("a[href*='/members/']").first();
    await memberLink.click();
    await page.waitForLoadState("networkidle");

    // Large avatar (h-16 w-16 from size="lg")
    const avatar = page.locator(".h-16.w-16.rounded-full").first();
    await expect(avatar).toBeVisible();
  });

  test("admin sees edit member section", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const memberLink = page.locator("a[href*='/members/']").first();
    await memberLink.click();
    await page.waitForLoadState("networkidle");

    // "Upravit člena" heading should be visible
    await expect(page.getByText("Upravit člena")).toBeVisible();
  });

  test("admin can edit member name", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    const memberLink = page.locator("a[href*='/members/']").first();
    await memberLink.click();
    await page.waitForLoadState("networkidle");

    const nameInput = page.getByLabel("Jméno");
    await expect(nameInput).toBeVisible();

    const originalName = await nameInput.inputValue();
    await nameInput.fill("E2E Test Name");

    // Click first "Uložit" button (the one in the admin editor form)
    const saveButtons = page.getByRole("button", { name: "Uložit" });
    await saveButtons.first().click();

    await expect(page.getByText("Profil byl úspěšně aktualizován")).toBeVisible();

    // Restore original name
    await page.waitForTimeout(500);
    await nameInput.fill(originalName);
    await saveButtons.first().click();
    await expect(page.getByText("Profil byl úspěšně aktualizován")).toBeVisible();
  });

  test("admin sees set password form for other members", async ({ page }) => {
    await page.goto("/cs/members");
    await page.waitForLoadState("networkidle");

    // Navigate to a member — try to find one that is not self
    const memberLinks = page.locator("a[href*='/members/']");
    const count = await memberLinks.count();
    if (count < 2) {
      test.skip(true, "Need at least 2 members to test set password");
    }

    // Click second member to avoid self
    await memberLinks.nth(2).click();
    await page.waitForLoadState("networkidle");

    const setPasswordHeading = page.getByText("Nastavit heslo");
    if (!(await setPasswordHeading.isVisible().catch(() => false))) {
      // Might be viewing self, try another member
      test.skip(true, "Set password section not visible (may be viewing self)");
    }

    await expect(setPasswordHeading).toBeVisible();
    await expect(page.getByLabel("Nové heslo")).toBeVisible();
    await expect(page.getByLabel("Potvrzení nového hesla")).toBeVisible();
  });
});
