import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Global mock for sonner toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));
