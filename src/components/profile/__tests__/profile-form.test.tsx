import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileForm } from "../profile-form";
import type { Member } from "@/lib/db/repositories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      "profile.name": "Name",
      "profile.email": "Email",
      "profile.phone": "Phone",
      "profile.picture": "Profile picture",
      "profile.language": "Language",
      "profile.save": "Save",
      "profile.profileUpdated": "Profile updated successfully",
      "members.voiceGroup": "Voice Group",
      "members.allGroups": "All",
      "members.voiceGroups.S": "Soprano",
      "members.voiceGroups.A": "Alto",
      "members.voiceGroups.T": "Tenor",
      "members.voiceGroups.B": "Bass",
      "common.loading": "Loading...",
    };
    return labels[key] ?? key;
  },
  useLocale: () => "cs",
}));

vi.mock("@/lib/i18n/routing", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/profile",
}));

const mockMember: Member = {
  id: "member-1",
  ensembleId: "ensemble-1",
  userId: "user-1",
  name: "Alice",
  email: "alice@test.com",
  phone: "123456",
  profilePicture: null,
  voiceGroup: "S",
  preferredLocale: "cs",
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: ["member"],
};

describe("ProfileForm", () => {
  it("renders with prefilled data", () => {
    render(<ProfileForm member={mockMember} />);
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
    expect(screen.getByDisplayValue("alice@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123456")).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<ProfileForm member={mockMember} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
