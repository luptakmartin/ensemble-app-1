import { chromium, type FullConfig } from "@playwright/test";
import { testAccounts } from "./test-accounts";
import fs from "fs";
import path from "path";

const authDir = path.resolve(__dirname, "../.auth");

async function loginAndSaveState(
  email: string,
  password: string,
  statePath: string,
  baseURL: string,
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseURL}/cs/login`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Heslo").fill(password);
  await page.getByRole("button", { name: "Přihlásit se" }).click();

  await page.waitForURL("**/cs/events", { timeout: 15_000 });

  await context.storageState({ path: statePath });
  await browser.close();
}

export default async function globalSetup(config: FullConfig) {
  const baseURL =
    config.projects[0]?.use?.baseURL ?? "http://localhost:3000";

  fs.mkdirSync(authDir, { recursive: true });

  for (const [role, creds] of Object.entries(testAccounts)) {
    await loginAndSaveState(
      creds.email,
      creds.password,
      path.join(authDir, `${role}.json`),
      baseURL,
    );
  }
}
