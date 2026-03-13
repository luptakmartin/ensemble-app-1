import type { Page, Locator } from "@playwright/test";

export class NavigationPage {
  constructor(private page: Page) {}

  get eventsLink(): Locator {
    return this.page.getByRole("link", { name: "Události" });
  }

  get compositionsLink(): Locator {
    return this.page.getByRole("link", { name: "Skladby" });
  }

  get membersLink(): Locator {
    return this.page.getByRole("link", { name: "Členové" });
  }

  get profileLink(): Locator {
    return this.page.getByRole("link", { name: "Profil" });
  }

  get logoutButton(): Locator {
    return this.page.getByRole("button", { name: "Odhlásit se" });
  }

  async navigateTo(path: string) {
    await this.page.goto(`/cs${path}`);
  }
}
