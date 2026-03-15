import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompositionList } from "../composition-list";
import type { CompositionWithCount } from "../types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      create: "Create Composition",
      noCompositions: "No compositions.",
    };
    return labels[key] ?? key;
  },
  useLocale: () => "en",
}));

vi.mock("@/lib/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/compositions",
}));

const mockComposition: CompositionWithCount = {
  id: "comp-1",
  ensembleId: "ensemble-1",
  name: "Ave Maria",
  author: "Bach",
  duration: "4:30",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  attachmentCount: 0,
};

describe("CompositionList", () => {
  it("renders composition cards", () => {
    render(
      <CompositionList compositions={[mockComposition]} canEdit={false} />
    );
    expect(screen.getByText("Ave Maria")).toBeInTheDocument();
  });

  it("shows empty state when no compositions", () => {
    render(<CompositionList compositions={[]} canEdit={false} />);
    expect(screen.getByText("No compositions.")).toBeInTheDocument();
  });

  it("shows create button when canEdit", () => {
    render(<CompositionList compositions={[]} canEdit={true} />);
    expect(screen.getByText("Create Composition")).toBeInTheDocument();
  });

  it("hides create button when not canEdit", () => {
    render(<CompositionList compositions={[]} canEdit={false} />);
    expect(screen.queryByText("Create Composition")).not.toBeInTheDocument();
  });

  it("shows attachment count when attachments exist", () => {
    render(
      <CompositionList
        compositions={[{ ...mockComposition, attachmentCount: 3 }]}
        canEdit={false}
      />
    );
    expect(screen.getByText(/3 compositions\.attachments/)).toBeInTheDocument();
  });

  it("hides attachment indicator when count is zero", () => {
    render(
      <CompositionList
        compositions={[mockComposition]}
        canEdit={false}
      />
    );
    // The div is rendered but hidden via CSS class
    const attachmentText = screen.getByText(/0 compositions\.attachments/);
    expect(attachmentText.closest(".hidden")).toBeInTheDocument();
  });
});
