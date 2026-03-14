import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompositionList } from "../composition-list";
import type { Composition } from "@/lib/db/repositories";

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

const mockComposition: Composition = {
  id: "comp-1",
  ensembleId: "ensemble-1",
  name: "Ave Maria",
  author: "Bach",
  duration: "4:30",
  createdAt: new Date(),
  updatedAt: new Date(),
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
        compositions={[mockComposition]}
        canEdit={false}
        attachmentCounts={{ "comp-1": 3 }}
      />
    );
    expect(screen.getByText(/3 compositions\.attachments/)).toBeInTheDocument();
  });

  it("does not show attachment indicator when count is zero", () => {
    render(
      <CompositionList
        compositions={[mockComposition]}
        canEdit={false}
        attachmentCounts={{ "comp-1": 0 }}
      />
    );
    // The "attachments" text should not appear since count is 0
    expect(screen.queryByText(/compositions\.attachments/i)).not.toBeInTheDocument();
  });
});
