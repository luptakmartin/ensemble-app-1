import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { EventsPage } from "../pages/events.page";
import { NavigationPage } from "../pages/navigation.page";

type Fixtures = {
  loginPage: LoginPage;
  eventsPage: EventsPage;
  nav: NavigationPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  eventsPage: async ({ page }, use) => {
    await use(new EventsPage(page));
  },
  nav: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },
});

export { expect } from "@playwright/test";
