import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SkeletonCard } from "../skeleton-card";

describe("SkeletonCard", () => {
  it("renders skeleton elements", () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("renders a card structure", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector("[data-slot='card']")).toBeInTheDocument();
  });
});
