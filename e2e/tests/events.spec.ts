import { test, expect } from "../fixtures/test";

test.describe("Events page", () => {
  test("shows events heading", async ({ eventsPage }) => {
    await eventsPage.goto();
    await expect(eventsPage.heading).toBeVisible();
  });

  test("has upcoming and past tabs", async ({ eventsPage }) => {
    await eventsPage.goto();
    await expect(eventsPage.upcomingTab).toBeVisible();
    await expect(eventsPage.pastTab).toBeVisible();
  });

  test("switches between upcoming and past tabs", async ({ eventsPage }) => {
    await eventsPage.goto();

    await eventsPage.pastTab.click();
    await expect(eventsPage.pastTab).toHaveAttribute("data-state", "active");

    await eventsPage.upcomingTab.click();
    await expect(eventsPage.upcomingTab).toHaveAttribute(
      "data-state",
      "active",
    );
  });

  test("admin sees create event button", async ({ eventsPage }) => {
    // Default storageState for chromium project is admin
    await eventsPage.goto();
    await expect(eventsPage.createButton).toBeVisible();
  });
});

test.describe("Events page (member role)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("member does not see create event button", async ({ eventsPage }) => {
    await eventsPage.goto();
    await expect(eventsPage.heading).toBeVisible();
    await expect(eventsPage.createButton).not.toBeVisible();
  });
});
