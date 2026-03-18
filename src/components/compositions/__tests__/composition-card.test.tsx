import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/lib/i18n/routing", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CompositionCard } from "../composition-card";
import type { CompositionWithCount } from "../types";

function makeComposition(
  overrides: Partial<CompositionWithCount> = {}
): CompositionWithCount {
  return {
    id: "comp-1",
    ensembleId: "ens-1",
    name: "Ave Maria",
    author: "Franz Schubert",
    duration: "4:30",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    attachmentCount: 0,
    ...overrides,
  };
}

describe("CompositionCard", () => {
  it("renders composition name and author", () => {
    render(
      <CompositionCard
        composition={makeComposition()}
        canEdit={false}
      />
    );
    expect(screen.getByText("Ave Maria")).toBeInTheDocument();
    expect(screen.getByText("Franz Schubert")).toBeInTheDocument();
  });

  it("shows attachment count when > 0", () => {
    render(
      <CompositionCard
        composition={makeComposition({ attachmentCount: 3 })}
        canEdit={false}
      />
    );
    expect(
      screen.getByText("3 compositions.attachments")
    ).toBeInTheDocument();
  });

  it("hides attachment count when 0", () => {
    render(
      <CompositionCard
        composition={makeComposition({ attachmentCount: 0 })}
        canEdit={false}
      />
    );
    const attachmentText = screen.getByText("0 compositions.attachments");
    expect(attachmentText.parentElement).toHaveClass("hidden");
  });

  it("shows dropdown menu when canEdit", () => {
    render(
      <CompositionCard
        composition={makeComposition()}
        canEdit={true}
      />
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides dropdown menu when not canEdit", () => {
    render(
      <CompositionCard
        composition={makeComposition()}
        canEdit={false}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
