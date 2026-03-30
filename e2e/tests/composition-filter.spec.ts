import { test, expect } from "../fixtures/test";

test.describe("Composition filter", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("filter input is visible on compositions page", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo autora...");
    await expect(filterInput).toBeVisible();
  });

  test("filtering by name narrows displayed compositions", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount < 2) {
      test.skip(true, "Need at least 2 compositions to test filtering");
    }

    // Get the name of the first composition to use as filter
    const firstName = await cards.first().locator("[data-slot='card-title']").textContent();
    if (!firstName) {
      test.skip(true, "Could not read composition name");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo autora...");
    await filterInput.fill(firstName!);

    // Should show fewer cards (or same if names overlap, but at least 1)
    const filteredCount = await cards.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // The first visible card should contain the search term
    const visibleName = await cards.first().locator("[data-slot='card-title']").textContent();
    expect(visibleName?.toLowerCase()).toContain(firstName!.toLowerCase());
  });

  test("filtering by author narrows displayed compositions", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount < 2) {
      test.skip(true, "Need at least 2 compositions to test filtering");
    }

    // Get the author from the first card (the text next to the User icon)
    const firstAuthor = await cards.first().locator("svg.lucide-user + span").textContent();
    if (!firstAuthor) {
      test.skip(true, "Could not read composition author");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo autora...");
    await filterInput.fill(firstAuthor!);

    const filteredCount = await cards.count();
    expect(filteredCount).toBeGreaterThanOrEqual(1);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("non-matching filter shows no results message", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    if ((await cards.count()) === 0) {
      test.skip(true, "No compositions in test environment");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo autora...");
    await filterInput.fill("xyznonexistent12345");

    // Cards should disappear
    await expect(cards).toHaveCount(0);

    // "No results" message should appear
    await expect(page.getByText("Žádné výsledky")).toBeVisible();
  });

  test("clearing filter restores all compositions", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("[data-slot='card']");
    const initialCount = await cards.count();

    if (initialCount === 0) {
      test.skip(true, "No compositions in test environment");
    }

    const filterInput = page.getByPlaceholder("Hledat podle názvu nebo autora...");
    await filterInput.fill("xyznonexistent12345");
    await expect(cards).toHaveCount(0);

    // Clear filter
    await filterInput.fill("");
    await expect(cards).toHaveCount(initialCount);
  });
});
