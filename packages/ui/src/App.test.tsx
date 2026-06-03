import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./api", () => ({
  api: {
    sessions: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue(null),
    },
  },
}));

test("renders app heading", async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Research Paper Assistant");
  });
});

test("renders tab navigation buttons", async () => {
  render(<App />);
  await waitFor(() => {
    const tabs = screen.getAllByRole("button");
    const tabTexts = tabs.map((b) => b.textContent);
    expect(tabTexts).toContain("Ingest");
    expect(tabTexts).toContain("Search");
    expect(tabTexts).toContain("Draft");
  });
});
