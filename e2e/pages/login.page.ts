import type { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel("E-mail");
    this.passwordInput = page.getByLabel("Heslo");
    this.submitButton = page.getByRole("button", { name: "Přihlásit se" });
    this.errorMessage = page.locator(".text-destructive");
  }

  async goto() {
    await this.page.goto("/cs/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
