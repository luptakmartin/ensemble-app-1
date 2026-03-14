import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AttachmentList } from "../attachment-list";
import type { Attachment } from "@/lib/db/repositories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      attachments: "Attachments",
      sheets: "Sheets",
      audio: "Audio",
    };
    return labels[key] ?? key;
  },
}));

vi.mock("@/lib/i18n/routing", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const sheetAttachment: Attachment = {
  id: "a1",
  compositionId: "comp-1",
  type: "sheet",
  name: "Sheet Music PDF",
  url: "https://example.com/sheet.pdf",
  isLink: true,
  createdAt: new Date(),
};

const audioAttachment: Attachment = {
  id: "a2",
  compositionId: "comp-1",
  type: "audio",
  name: "Audio Recording",
  url: "https://example.com/audio.mp3",
  isLink: false,
  createdAt: new Date(),
};

describe("AttachmentList", () => {
  it("renders sheet and audio sections", () => {
    render(
      <AttachmentList
        attachments={[sheetAttachment, audioAttachment]}
        compositionId="comp-1"
        canEdit={false}
      />
    );
    expect(screen.getByText("Sheet Music PDF")).toBeInTheDocument();
    expect(screen.getByText("Audio Recording")).toBeInTheDocument();
    expect(screen.getByText("Sheets")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("shows edit and delete buttons when canEdit", () => {
    render(
      <AttachmentList
        attachments={[sheetAttachment]}
        compositionId="comp-1"
        canEdit={true}
      />
    );
    expect(screen.getByTestId("edit-attachment-button")).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBe(2);
  });

  it("shows inline edit form when edit button clicked", () => {
    render(
      <AttachmentList
        attachments={[sheetAttachment]}
        compositionId="comp-1"
        canEdit={true}
      />
    );
    fireEvent.click(screen.getByTestId("edit-attachment-button"));
    expect(screen.getByTestId("edit-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("save-edit-button")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-edit-button")).toBeInTheDocument();
  });

  it("cancels edit when cancel button clicked", () => {
    render(
      <AttachmentList
        attachments={[sheetAttachment]}
        compositionId="comp-1"
        canEdit={true}
      />
    );
    fireEvent.click(screen.getByTestId("edit-attachment-button"));
    expect(screen.getByTestId("edit-name-input")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("cancel-edit-button"));
    expect(screen.queryByTestId("edit-name-input")).not.toBeInTheDocument();
    expect(screen.getByText("Sheet Music PDF")).toBeInTheDocument();
  });

  it("returns null when no attachments", () => {
    const { container } = render(
      <AttachmentList attachments={[]} compositionId="comp-1" canEdit={false} />
    );
    expect(container.innerHTML).toBe("");
  });
});
