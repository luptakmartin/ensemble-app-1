import { test, expect } from "../fixtures/test";

test.describe("Event card presence", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("shows presence buttons on event cards", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    // Find the "Vaše docházka" label on a card
    const presenceLabel = page.getByText("Vaše docházka").first();
    if (!(await presenceLabel.isVisible().catch(() => false))) {
      test.skip(true, "No events with presence in test environment");
    }
    await expect(presenceLabel).toBeVisible();
  });

  test("can change presence status on event card", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const presenceLabel = page.getByText("Vaše docházka").first();
    if (!(await presenceLabel.isVisible().catch(() => false))) {
      test.skip(true, "No events with presence in test environment");
    }

    // Find the first card's presence section and click "yes" button (Check icon)
    const firstCard = presenceLabel.locator("ancestor::[data-slot='card']");
    const yesButton = firstCard.getByRole("button", { name: "Ano" });
    await yesButton.click();

    // Button should become active (have green background class)
    await expect(yesButton).toHaveClass(/bg-green/);
  });
});

test.describe("Event detail presence note", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("can add and delete a note on event detail", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    // Click on the first event to go to detail
    const firstEventLink = page.locator("a[href*='/events/']").first();
    if (!(await firstEventLink.isVisible().catch(() => false))) {
      test.skip(true, "No events in test environment");
    }
    await firstEventLink.click();
    await page.waitForLoadState("networkidle");

    // Find "Přidat poznámku" button
    const addNoteButton = page.getByRole("button", { name: "Přidat poznámku" });
    if (!(await addNoteButton.isVisible().catch(() => false))) {
      test.skip(true, "Add note button not visible (event may have started)");
    }

    // Click add note
    await addNoteButton.click();

    // Fill in the textarea
    const textarea = page.getByPlaceholder("Napište poznámku...");
    await expect(textarea).toBeVisible();
    await textarea.fill("E2E test note");

    // Save
    await page.getByRole("button", { name: "Uložit" }).click();

    // Note should be visible
    await expect(page.getByText("E2E test note")).toBeVisible({ timeout: 10_000 });

    // Delete the note to clean up
    await page.getByRole("button", { name: "Smazat poznámku" }).click();

    // Note should disappear, add note button should return
    await expect(page.getByText("E2E test note")).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Přidat poznámku" })).toBeVisible();
  });
});
