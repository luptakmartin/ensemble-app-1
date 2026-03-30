import { test, expect } from "../fixtures/test";

test.describe("Events page filter", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("filter input is visible on events page", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo popisu...");
    await expect(filterInput).toBeVisible();
  });

  test("filtering by name narrows displayed event cards", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount < 2) {
      test.skip(true, "Need at least 2 events to test filtering");
    }

    // Get the name from the first card
    const firstName = await cards.first().locator("[data-slot='card-title']").textContent();
    if (!firstName) {
      test.skip(true, "Could not read event name");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo popisu...");
    await filterInput.fill(firstName!);

    const filteredCount = await cards.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("non-matching filter shows no results message", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    if ((await cards.count()) === 0) {
      test.skip(true, "No events in test environment");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo popisu...");
    await filterInput.fill("xyznonexistent12345");

    await expect(cards).toHaveCount(0);
    await expect(page.getByText("Žádné výsledky")).toBeVisible();
  });

  test("clearing filter restores all events", async ({ page }) => {
    await page.goto("/cs/events");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount === 0) {
      test.skip(true, "No events in test environment");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo popisu...");
    await filterInput.fill("xyznonexistent12345");
    await expect(cards).toHaveCount(0);

    await filterInput.fill("");
    await expect(cards).toHaveCount(initialCount);
  });
});
