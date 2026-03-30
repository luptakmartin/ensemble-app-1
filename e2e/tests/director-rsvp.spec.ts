import { test, expect } from "../fixtures/test";

// Event card links contain a UUID in the path, unlike nav or create links
const eventCardLink = "a[href*='/events/'][href*='-']";

async function navigateToFirstEventDetail(page: import("@playwright/test").Page) {
  await page.goto("/cs/events");
  await page.waitForLoadState("networkidle");

  const firstLink = page.locator(eventCardLink).first();
  if (!(await firstLink.isVisible().catch(() => false))) {
    return false;
  }
  await firstLink.click();
  await page.waitForLoadState("networkidle");
  return true;
}

async function openDetailTab(page: import("@playwright/test").Page) {
  const detailTab = page.getByRole("tab", { name: "Detail" });
  await expect(detailTab).toBeVisible();
  await detailTab.click();
}

function getOtherMemberRow(page: import("@playwright/test").Page) {
  return page
    .locator("[class*='flex items-center justify-between py-1']")
    .filter({ hasNot: page.locator(".font-semibold") })
    .first();
}

test.describe("Director can set RSVP for other members", () => {
  test.use({ storageState: "./e2e/.auth/director.json" });

  test("director sees presence buttons for other members in attendance detail", async ({
    page,
  }) => {
    if (!(await navigateToFirstEventDetail(page))) {
      test.skip(true, "No events in test environment");
    }

    await openDetailTab(page);

    const otherMemberRow = getOtherMemberRow(page);
    if (!(await otherMemberRow.isVisible().catch(() => false))) {
      test.skip(true, "No other members visible in attendance detail");
    }

    // Director should see 4 presence buttons (yes, maybe, no, unset) for other members
    const presenceButtons = otherMemberRow.getByRole("button");
    await expect(presenceButtons.first()).toBeVisible();
    const buttonCount = await presenceButtons.count();
    expect(buttonCount).toBe(4);
  });

  test("director can change another member's RSVP status", async ({
    page,
  }) => {
    if (!(await navigateToFirstEventDetail(page))) {
      test.skip(true, "No events in test environment");
    }

    await openDetailTab(page);

    const otherMemberRow = getOtherMemberRow(page);
    if (!(await otherMemberRow.isVisible().catch(() => false))) {
      test.skip(true, "No other members visible in attendance detail");
    }

    // Record current status badge text
    const badge = otherMemberRow.locator("[data-slot='badge']");
    const originalStatus = await badge.textContent();

    // Toggle between "Ano" and "Ne"
    const targetStatus = originalStatus?.trim() === "Ano" ? "Ne" : "Ano";
    await otherMemberRow.getByRole("button", { name: targetStatus }).click();

    // Badge should update
    await expect(badge).toHaveText(targetStatus, { timeout: 10_000 });

    // Restore original status to clean up
    const restoreStatus = originalStatus?.trim() || "Nenastaveno";
    await otherMemberRow.getByRole("button", { name: restoreStatus }).click();
    await expect(badge).toHaveText(restoreStatus, { timeout: 10_000 });
  });
});

test.describe("Member cannot set RSVP for other members", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("member does not see presence buttons for other members", async ({
    page,
  }) => {
    if (!(await navigateToFirstEventDetail(page))) {
      test.skip(true, "No events in test environment");
    }

    await openDetailTab(page);

    const otherMemberRow = getOtherMemberRow(page);
    if (!(await otherMemberRow.isVisible().catch(() => false))) {
      test.skip(true, "No other members visible in attendance detail");
    }

    // Member should NOT see presence buttons for other members
    const presenceButtons = otherMemberRow.getByRole("button");
    await expect(presenceButtons).toHaveCount(0);
  });
});
