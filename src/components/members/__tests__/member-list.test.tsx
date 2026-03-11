import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemberList } from "../member-list";
import type { Member } from "@/lib/db/repositories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      allGroups: "All",
      invite: "Invite Member",
      noMembers: "No members.",
      "voiceGroups.S": "Soprano",
      "voiceGroups.A": "Alto",
      "voiceGroups.T": "Tenor",
      "voiceGroups.B": "Bass",
      "roles.admin": "Administrator",
      "roles.member": "Member",
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
  usePathname: () => "/members",
}));

const mockMember: Member = {
  id: "member-1",
  ensembleId: "ensemble-1",
  userId: "user-1",
  name: "Alice",
  email: "alice@test.com",
  phone: null,
  profilePicture: null,
  voiceGroup: "S",
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: ["member"],
};

describe("MemberList", () => {
  it("renders member cards", () => {
    render(<MemberList members={[mockMember]} isAdmin={false} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    render(<MemberList members={[]} isAdmin={false} />);
    expect(screen.getByText("No members.")).toBeInTheDocument();
  });

  it("shows invite button for admins", () => {
    render(<MemberList members={[]} isAdmin={true} />);
    expect(screen.getByText("Invite Member")).toBeInTheDocument();
  });
});
