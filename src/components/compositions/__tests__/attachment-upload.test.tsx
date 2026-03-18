import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/i18n/routing", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock the Select components to avoid Radix portal issues in tests
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, ...props }: any) => (
    <div data-testid="select-root">{children}</div>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <button data-testid="select-trigger" {...props}>
      {children}
    </button>
  ),
  SelectContent: ({ children, ...props }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
  SelectValue: (props: any) => <span data-testid="select-value" />,
}));

import { AttachmentUpload } from "../attachment-upload";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
});

describe("AttachmentUpload", () => {
  it("renders collapsed button by default", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    expect(screen.getByTestId("open-attachment-upload")).toBeInTheDocument();
    expect(screen.getByText("addAttachment")).toBeInTheDocument();
    // Form elements should not be visible
    expect(screen.queryByTestId("select-trigger")).not.toBeInTheDocument();
  });

  it("expands form when button clicked", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    // Type select should be visible
    expect(screen.getByTestId("select-trigger")).toBeInTheDocument();
    // Mode buttons should be visible
    expect(screen.getByText("linkUrl")).toBeInTheDocument();
    expect(screen.getByText("uploadFile")).toBeInTheDocument();
  });

  it("collapses form when close button clicked", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    // Expand
    fireEvent.click(screen.getByTestId("open-attachment-upload"));
    expect(screen.getByTestId("select-trigger")).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByTestId("close-attachment-upload"));
    expect(screen.queryByTestId("select-trigger")).not.toBeInTheDocument();
    expect(screen.getByTestId("open-attachment-upload")).toBeInTheDocument();
  });

  it("shows link URL field in link mode", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    // Link mode is default
    const urlInput = screen.getByLabelText("URL");
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute("type", "url");
  });

  it("shows drop zone in file mode", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    // Switch to file mode
    fireEvent.click(screen.getByText("uploadFile"));

    expect(screen.getByTestId("drop-zone")).toBeInTheDocument();
    expect(screen.queryByLabelText("URL")).not.toBeInTheDocument();
  });

  it("name field is not required", () => {
    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    const nameInput = screen.getByLabelText("name");
    expect(nameInput).not.toHaveAttribute("required");
  });

  it("submits link attachment", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    // Fill URL
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://example.com/sheet.pdf" },
    });

    // Submit the form
    const submitButtons = screen.getAllByText("addAttachment");
    // The submit button is the last one with that text
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/compositions/comp-1/attachments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: undefined,
            url: "https://example.com/sheet.pdf",
            type: "sheet",
            isLink: true,
          }),
        }
      );
    });
  });

  it("collapses after successful submit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(<AttachmentUpload compositionId="comp-1" />);
    fireEvent.click(screen.getByTestId("open-attachment-upload"));

    // Fill URL
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://example.com/sheet.pdf" },
    });

    // Submit
    const submitButtons = screen.getAllByText("addAttachment");
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    // After successful submit, form should collapse
    await waitFor(() => {
      expect(screen.getByTestId("open-attachment-upload")).toBeInTheDocument();
      expect(screen.queryByTestId("select-trigger")).not.toBeInTheDocument();
    });
  });
});
