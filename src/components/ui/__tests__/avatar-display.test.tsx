import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvatarDisplay } from "../avatar-display";

describe("AvatarDisplay", () => {
  it("renders image when imageUrl provided", () => {
    render(<AvatarDisplay name="John Doe" imageUrl="https://example.com/photo.jpg" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    expect(img).toHaveAttribute("alt", "John Doe");
    expect(img.className).toContain("rounded-full");
    expect(img.className).toContain("object-cover");
  });

  it("renders initials when no imageUrl", () => {
    render(<AvatarDisplay name="John Doe" />);
    expect(screen.getByText("JD")).toBeDefined();
  });

  it("renders single initial for single name", () => {
    render(<AvatarDisplay name="Alice" />);
    expect(screen.getByText("A")).toBeDefined();
  });

  it("applies correct size classes for sm", () => {
    const { container } = render(<AvatarDisplay name="John Doe" size="sm" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-8");
    expect(el.className).toContain("w-8");
  });

  it("applies correct size classes for md (default)", () => {
    const { container } = render(<AvatarDisplay name="John Doe" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-10");
  });

  it("applies correct size classes for lg", () => {
    const { container } = render(<AvatarDisplay name="John Doe" size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-16");
    expect(el.className).toContain("w-16");
  });

  it("applies size classes to image variant", () => {
    const { container } = render(
      <AvatarDisplay name="John Doe" imageUrl="https://example.com/photo.jpg" size="lg" />
    );
    const img = container.firstChild as HTMLElement;
    expect(img.className).toContain("h-16");
    expect(img.className).toContain("w-16");
  });

  it("uses deterministic color for same name", () => {
    const { container: c1 } = render(<AvatarDisplay name="Alice Smith" />);
    const { container: c2 } = render(<AvatarDisplay name="Alice Smith" />);
    expect((c1.firstChild as HTMLElement).className).toBe(
      (c2.firstChild as HTMLElement).className
    );
  });
});
