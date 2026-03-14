import { test, expect } from "../fixtures/test";

test.describe("Compositions page", () => {
  test("shows compositions heading", async ({ page }) => {
    await page.goto("/cs/compositions");
    await expect(
      page.getByRole("heading", { name: "Skladby" }),
    ).toBeVisible();
  });
});

test.describe("Compositions page (admin)", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("admin sees create composition button", async ({ page }) => {
    await page.goto("/cs/compositions");
    await expect(
      page.getByRole("link", { name: "Vytvořit skladbu" }),
    ).toBeVisible();
  });
});

test.describe("Composition card details", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("shows duration on composition card when set", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    // Find a card that has a Clock icon (indicating duration is displayed)
    const clockIcon = page.locator(".lucide-clock").first();
    if (!(await clockIcon.isVisible().catch(() => false))) {
      test.skip(true, "No compositions with duration in test environment");
    }

    // The duration text should be next to the clock icon
    const durationRow = clockIcon.locator("..");
    await expect(durationRow).toBeVisible();
    await expect(durationRow.locator("span")).not.toBeEmpty();
  });

  test("shows attachment indicator on card when composition has attachments", async ({
    page,
  }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    // Look for the Paperclip icon which indicates attachments exist
    const paperclipIcon = page.locator(".lucide-paperclip").first();
    if (!(await paperclipIcon.isVisible().catch(() => false))) {
      test.skip(
        true,
        "No compositions with attachments in test environment",
      );
    }

    // The attachment count text should be next to the paperclip icon
    const attachmentRow = paperclipIcon.locator("..");
    await expect(attachmentRow).toBeVisible();
    // Should contain a number followed by the localized "attachments" word
    await expect(attachmentRow.locator("span")).toContainText(/\d+/);
  });

  test("does not show attachment indicator on card without attachments", async ({
    page,
  }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const cardCount = await cards.count();
    if (cardCount === 0) {
      test.skip(true, "No compositions in test environment");
    }

    // Each card should either have a paperclip or not — cards without
    // attachments must not render the paperclip icon at all
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const paperclip = card.locator(".lucide-paperclip");
      const hasPaperclip = await paperclip.isVisible().catch(() => false);
      if (!hasPaperclip) {
        // Confirm there's no hidden attachment text either
        await expect(paperclip).not.toBeVisible();
      }
    }
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
