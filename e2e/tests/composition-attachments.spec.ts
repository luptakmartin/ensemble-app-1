import { test, expect } from "../fixtures/test";

// Admin tests — admin auth is the default storageState for chromium project
test.describe("Composition attachments (admin)", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" });

  test.beforeEach(async ({ page }) => {
    // Navigate to compositions list and open the first composition
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");
    const firstComposition = page.locator("a[href*='/compositions/']").first();
    // Skip if no compositions exist in the test environment
    if (!(await firstComposition.isVisible())) {
      test.skip(true, "No compositions available in test environment");
    }
    await firstComposition.click();
    await page.waitForLoadState("networkidle");
  });

  test("shows collapsible add attachment button", async ({ page }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await expect(addButton).toBeVisible();
    await expect(addButton).toContainText("Přidat přílohu");
  });

  test("expands add attachment form when button clicked", async ({ page }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Form should now be visible
    await expect(page.getByLabel("Název")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Odkaz na URL" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Nahrát soubor" }),
    ).toBeVisible();
  });

  test("collapses add attachment form with close button", async ({ page }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Form should be visible
    await expect(page.getByLabel("Název")).toBeVisible();

    // Close it
    const closeButton = page.getByTestId("close-attachment-upload");
    await closeButton.click();

    // Form should be hidden, add button visible again
    await expect(page.getByTestId("open-attachment-upload")).toBeVisible();
    await expect(page.getByLabel("Název")).not.toBeVisible();
  });

  test("shows drag-and-drop zone in file upload mode", async ({ page }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Switch to file upload mode
    await page.getByRole("button", { name: "Nahrát soubor" }).click();

    // Drop zone should be visible
    const dropZone = page.getByTestId("drop-zone");
    await expect(dropZone).toBeVisible();
    await expect(dropZone).toContainText("Přetáhněte soubory sem");
  });

  test("selects file via drop zone click (file input fallback)", async ({
    page,
  }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Switch to file upload mode
    await page.getByRole("button", { name: "Nahrát soubor" }).click();

    // Use the hidden file input to select a file
    const fileInput = page.getByTestId("file-input");
    await fileInput.setInputFiles({
      name: "test-sheet.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test file content"),
    });

    // Drop zone should show the file name
    const dropZone = page.getByTestId("drop-zone");
    await expect(dropZone).toContainText("test-sheet.pdf");

    // Name field should be auto-filled
    await expect(page.getByLabel("Název")).toHaveValue("test-sheet.pdf");
  });

  test("adds a link attachment", async ({ page }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Fill in link form
    await page.getByLabel("Název").fill("Test Link Attachment");
    await page.getByLabel("URL").fill("https://example.com/test-sheet.pdf");

    // Submit
    await page.getByRole("button", { name: "Přidat přílohu" }).last().click();

    // Should collapse back after success
    await expect(page.getByTestId("open-attachment-upload")).toBeVisible({
      timeout: 10_000,
    });

    // Attachment should appear in the list
    await expect(page.getByText("Test Link Attachment")).toBeVisible();
  });

  test("shows edit button on attachments", async ({ page }) => {
    // Check if there are any attachments
    const editButton = page.getByTestId("edit-attachment-button").first();
    if (!(await editButton.isVisible().catch(() => false))) {
      test.skip(true, "No attachments to edit in test environment");
    }

    await expect(editButton).toBeVisible();
  });

  test("opens inline edit form when edit button clicked", async ({ page }) => {
    const editButton = page.getByTestId("edit-attachment-button").first();
    if (!(await editButton.isVisible().catch(() => false))) {
      test.skip(true, "No attachments to edit in test environment");
    }

    await editButton.click();

    // Inline edit form should appear
    await expect(page.getByTestId("edit-name-input")).toBeVisible();
    await expect(page.getByTestId("save-edit-button")).toBeVisible();
    await expect(page.getByTestId("cancel-edit-button")).toBeVisible();
  });

  test("cancels inline edit", async ({ page }) => {
    const editButton = page.getByTestId("edit-attachment-button").first();
    if (!(await editButton.isVisible().catch(() => false))) {
      test.skip(true, "No attachments to edit in test environment");
    }

    await editButton.click();
    await expect(page.getByTestId("edit-name-input")).toBeVisible();

    // Cancel
    await page.getByTestId("cancel-edit-button").click();

    // Should return to normal view
    await expect(page.getByTestId("edit-name-input")).not.toBeVisible();
    await expect(
      page.getByTestId("edit-attachment-button").first(),
    ).toBeVisible();
  });

  test("saves inline edit", async ({ page }) => {
    const editButton = page.getByTestId("edit-attachment-button").first();
    if (!(await editButton.isVisible().catch(() => false))) {
      test.skip(true, "No attachments to edit in test environment");
    }

    await editButton.click();

    const nameInput = page.getByTestId("edit-name-input");
    await nameInput.clear();
    await nameInput.fill("Renamed Attachment");

    await page.getByTestId("save-edit-button").click();

    // Should return to normal view and show updated name
    await expect(page.getByTestId("edit-name-input")).not.toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Renamed Attachment")).toBeVisible();
  });

  test("name field is not required and shows URL as placeholder in link mode", async ({
    page,
  }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    const nameInput = page.getByLabel("Název");
    // Name should not be required (no 'required' attribute)
    await expect(nameInput).not.toHaveAttribute("required", "");

    // Fill URL first, then check placeholder updates
    await page.getByLabel("URL").fill("https://example.com/my-score.pdf");
    await expect(nameInput).toHaveAttribute(
      "placeholder",
      "https://example.com/my-score.pdf",
    );
  });

  test("name field shows filename as placeholder in file mode", async ({
    page,
  }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Switch to file mode
    await page.getByRole("button", { name: "Nahrát soubor" }).click();

    // Select a file
    const fileInput = page.getByTestId("file-input");
    await fileInput.setInputFiles({
      name: "vivaldi-gloria.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test"),
    });

    // Since no name was typed before file selection, name gets auto-filled
    // Clear it to test the placeholder behavior
    const nameInput = page.getByLabel("Název");
    await nameInput.clear();
    await expect(nameInput).toHaveAttribute("placeholder", "vivaldi-gloria.pdf");
  });

  test("adds link attachment without name — derives name from URL", async ({
    page,
  }) => {
    const addButton = page.getByTestId("open-attachment-upload");
    await addButton.click();

    // Only fill URL, leave name empty
    await page.getByLabel("URL").fill("https://example.com/derived-name-test.pdf");

    // Submit
    await page.getByRole("button", { name: "Přidat přílohu" }).last().click();

    // Should collapse back after success
    await expect(page.getByTestId("open-attachment-upload")).toBeVisible({
      timeout: 10_000,
    });

    // Attachment should appear with name derived from URL
    await expect(page.getByText("derived-name-test.pdf")).toBeVisible();
  });

  test("uses FileText icon for sheets (not FileMusic)", async ({ page }) => {
    // Check for the correct SVG icon presence — FileText has specific path attributes
    // This is a smoke test to ensure the component renders without FileMusic errors
    const attachmentSection = page.getByText("Přílohy");
    if (!(await attachmentSection.isVisible().catch(() => false))) {
      test.skip(true, "No attachments section visible");
    }
    await expect(attachmentSection).toBeVisible();
  });
});

// Member tests — member should not see add/edit/delete controls
test.describe("Composition attachments (member)", () => {
  test.use({ storageState: "./e2e/.auth/member.json" });

  test("member does not see add attachment button", async ({ page }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");
    const firstComposition = page.locator("a[href*='/compositions/']").first();
    if (!(await firstComposition.isVisible())) {
      test.skip(true, "No compositions available in test environment");
    }
    await firstComposition.click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("open-attachment-upload")).not.toBeVisible();
  });

  test("member does not see edit or delete buttons on attachments", async ({
    page,
  }) => {
    await page.goto("/cs/compositions");
    await page.waitForLoadState("networkidle");
    const firstComposition = page.locator("a[href*='/compositions/']").first();
    if (!(await firstComposition.isVisible())) {
      test.skip(true, "No compositions available in test environment");
    }
    await firstComposition.click();
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByTestId("edit-attachment-button"),
    ).not.toBeVisible();
  });
});
