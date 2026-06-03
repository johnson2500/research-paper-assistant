import { render, screen } from "@testing-library/react";
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

test("renders app heading", () => {
  render(<App />);
  expect(screen.getByText("Research Paper Assistant")).toBeInTheDocument();
});

test("renders tab navigation", () => {
  render(<App />);
  expect(screen.getByText("Ingest")).toBeInTheDocument();
  expect(screen.getByText("Search")).toBeInTheDocument();
  expect(screen.getByText("Draft")).toBeInTheDocument();
});
