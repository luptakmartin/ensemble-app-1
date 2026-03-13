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
    await expect(eventsPage.pastTab).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await eventsPage.upcomingTab.click();
    await expect(eventsPage.upcomingTab).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

test.describe("Events page (admin)", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test("admin sees create event button", async ({ eventsPage }) => {
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
