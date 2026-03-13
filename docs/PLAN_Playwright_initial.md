# Plan: Prepare Playwright E2E Tests

## Context
The app has 34 Vitest unit tests but no end-to-end tests. Adding Playwright will enable testing real user flows (login, navigation, CRUD operations) against the running app with Supabase auth. This catches integration issues that unit tests with mocked dependencies cannot.

## 1. Install & Configure

**Install dependency:**
```
npm install -D @playwright/test
npx playwright install chromium
```

**Create `playwright.config.ts`** at project root:
- `testDir: './e2e/tests'`
- `baseURL: 'http://localhost:3000'`
- `webServer` block to auto-start `npm run dev`
- `locale: 'cs-CZ'` (match default app locale)
- `globalSetup: './e2e/setup/global-setup.ts'`
- Projects: `chromium` (desktop, admin storageState), `mobile` (Pixel 7 viewport, member storageState)
- Trace on first retry, screenshots on failure

**Add to `package.json` scripts:**
- `"test:e2e": "playwright test"`
- `"test:e2e:ui": "playwright test --ui"`
- `"test:e2e:headed": "playwright test --headed"`

**Add to `.gitignore`:**
- `e2e/.auth/`, `e2e/.env.e2e`, `playwright-report/`, `test-results/`

## 2. Auth Setup (Global Setup)

**Files:**
- `e2e/setup/test-accounts.ts` — loads test credentials from env vars
- `e2e/setup/global-setup.ts` — for each role (admin, director, member): opens browser, logs in via UI at `/cs/login`, saves storageState to `e2e/.auth/{role}.json`
- `e2e/.env.e2e` — test credentials (gitignored)
- `e2e/.env.e2e.example` — template (committed)

**Login form locators** (from `login-form.tsx` + `cs.json`):
- Email input: `getByLabel('E-mail')`
- Password input: `getByLabel('Heslo')`
- Submit button: `getByRole('button', { name: 'Přihlásit se' })`
- Success: wait for URL `**/cs/events`

## 3. Page Objects

Minimal page objects for reused pages:

- `e2e/pages/login.page.ts` — goto, login(email, password), error locator
- `e2e/pages/events.page.ts` — goto, heading (`Události`), tabs (`Nadcházející`/`Minulé`), create button (`Vytvořit událost`)
- `e2e/pages/navigation.page.ts` — sidebar link helper, navigateTo helper

**Custom test fixture** (`e2e/fixtures/test.ts`): extends base Playwright test with page object instances.

## 4. Test Specs

### `e2e/tests/auth.spec.ts` (P0)
- Login with valid credentials → redirects to `/cs/events`
- Login with wrong password → shows error "Nesprávný e-mail nebo heslo"
- Unauthenticated visit to `/cs/events` → redirects to `/cs/login`
- Logout → returns to login

### `e2e/tests/events.spec.ts` (P0)
- Events page loads with heading
- Upcoming/past tabs switch content
- Event card links to detail page
- Admin sees "Vytvořit událost" button; member does not

### `e2e/tests/members.spec.ts` (P1)
- Members list loads
- Admin can view member detail

### `e2e/tests/compositions.spec.ts` (P1)
- Compositions list loads for admin/director
- Navigation to composition detail works

### `e2e/tests/navigation.spec.ts` (P2)
- Sidebar links navigate correctly
- Mobile nav works on mobile viewport

## 5. File Structure

```
e2e/
  .env.e2e              # Credentials (gitignored)
  .env.e2e.example      # Template
  setup/
    global-setup.ts
    test-accounts.ts
  fixtures/
    test.ts
  pages/
    login.page.ts
    events.page.ts
    navigation.page.ts
  tests/
    auth.spec.ts
    events.spec.ts
    members.spec.ts
    compositions.spec.ts
    navigation.spec.ts
playwright.config.ts     # Project root
```

## 6. Files to Modify
- `package.json` — add `@playwright/test`, add e2e scripts
- `.gitignore` — add Playwright artifacts

## 7. Verification
1. `npm run test:e2e:headed` — run with browser visible to verify login flow works
2. `npm run test:e2e` — headless run, all specs pass
3. Check `playwright-report/` HTML report for results

## Prerequisites
- Test user accounts (admin, director, member) must exist in the Supabase dev project
- `e2e/.env.e2e` must be populated with valid credentials
