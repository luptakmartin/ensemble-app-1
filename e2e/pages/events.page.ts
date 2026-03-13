import type { Page, Locator } from "@playwright/test";

export class EventsPage {
  readonly heading: Locator;
  readonly upcomingTab: Locator;
  readonly pastTab: Locator;
  readonly createButton: Locator;

  constructor(private page: Page) {
    this.heading = page.getByRole("heading", { name: "Události" });
    this.upcomingTab = page.getByRole("tab", { name: "Nadcházející" });
    this.pastTab = page.getByRole("tab", { name: "Minulé" });
    this.createButton = page.getByRole("link", { name: "Vytvořit událost" });
  }

  async goto() {
    await this.page.goto("/cs/events");
    await this.page.waitForLoadState("networkidle");
  }
}
