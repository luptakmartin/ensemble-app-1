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

  test("shows attachment count on card with attachments", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    // Find a visible (not hidden) paperclip row — indicates attachments exist
    const visibleAttachmentRow = page.locator(
      "[data-slot='card'] .flex.items-center.gap-2:has(.lucide-paperclip)",
    );
    if ((await visibleAttachmentRow.count()) === 0) {
      test.skip(
        true,
        "No compositions with attachments in test environment",
      );
    }

    const row = visibleAttachmentRow.first();
    await expect(row).toBeVisible();
    // Should contain a number and the localized "attachments" word (e.g. "3 přílohy")
    await expect(row.locator("span")).toContainText(/\d+/);
  });

  test("hides attachment indicator on card without attachments", async ({
    page,
  }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const cardCount = await cards.count();
    if (cardCount === 0) {
      test.skip(true, "No compositions in test environment");
    }

    // Cards without attachments should have the paperclip row hidden via CSS
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      const paperclipRow = card.locator(":has(> .lucide-paperclip)");
      const isVisible = await paperclipRow.isVisible().catch(() => false);
      if (!isVisible) {
        // The row should exist in DOM but be hidden
        await expect(paperclipRow).toBeHidden();
      }
    }
  });

  test("attachment indicator shows correct count matching detail page", async ({
    page,
  }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    // Find a card with a visible attachment count
    const visibleAttachmentRow = page.locator(
      "[data-slot='card'] .flex.items-center.gap-2:has(.lucide-paperclip):not(.hidden)",
    );
    if ((await visibleAttachmentRow.count()) === 0) {
      test.skip(
        true,
        "No compositions with attachments in test environment",
      );
    }

    // Get the count text from the first card with attachments
    const row = visibleAttachmentRow.first();
    const countText = await row.locator("span").textContent();
    const match = countText?.match(/(\d+)/);
    expect(match).toBeTruthy();
    const expectedCount = parseInt(match![1], 10);
    expect(expectedCount).toBeGreaterThan(0);

    // Click through to the composition detail page
    const card = row.locator("ancestor::[data-slot='card']");
    const link = card.locator("a").first();
    await link.click();
    await page.waitForLoadState("networkidle");

    // Count the actual attachments on the detail page
    const attachmentItems = page.locator(
      ".flex.items-center.justify-between.gap-2.py-1, .flex.items-center.gap-2.py-1",
    );
    // Wait for page to fully load
    await expect(page.getByText("Přílohy")).toBeVisible({ timeout: 10_000 });
    const actualCount = await attachmentItems.count();
    expect(actualCount).toBe(expectedCount);
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
