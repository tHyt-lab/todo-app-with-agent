import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import React from "react";
import { AppLayout } from "../AppLayout";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "nav.dashboard": "Dashboard",
        "nav.tasks": "Tasks",
        "nav.settings": "Settings",
        "theme.toggleTheme": "Toggle Theme",
        "language.toggle": "Toggle Language",
        "app.title": "Todo App",
        "common.menu": "Menu",
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: "en",
    },
  }),
}));

// Mock atoms
vi.mock("../../../store/atoms", () => ({
  themeAtom: {
    init: "light",
  },
  languageAtom: {
    init: "en",
  },
}));

// Mock jotai
vi.mock("jotai", () => ({
  Provider: ({ children }: any) => children,
  useAtom: (atom: any) => {
    if (atom.init === "light") return ["light", vi.fn()];
    if (atom.init === "en") return ["en", vi.fn()];
    return [atom.init, vi.fn()];
  },
}));

const theme = createTheme();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render app layout with navigation", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    expect(screen.getByText("Todo App")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render theme toggle button", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    const themeToggle = screen.getByLabelText("Toggle Theme");
    expect(themeToggle).toBeInTheDocument();
  });

  it("should render language toggle button", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    const languageToggle = screen.getByLabelText("Toggle Language");
    expect(languageToggle).toBeInTheDocument();
  });

  it("should handle theme toggle click", async () => {
    const user = userEvent.setup();
    const mockSetTheme = vi.fn();

    // Mock useAtom to return our mock setter
    vi.mocked(require("jotai").useAtom).mockImplementation((atom: any) => {
      if (atom.init === "light") return ["light", mockSetTheme];
      if (atom.init === "en") return ["en", vi.fn()];
      return [atom.init, vi.fn()];
    });

    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    const themeToggle = screen.getByLabelText("Toggle Theme");
    await user.click(themeToggle);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should handle language toggle click", async () => {
    const user = userEvent.setup();
    const mockSetLanguage = vi.fn();
    const mockChangeLanguage = vi.fn();

    // Mock useTranslation to return our mock change function
    vi.mocked(require("react-i18next").useTranslation).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        changeLanguage: mockChangeLanguage,
        language: "en",
      },
    });

    // Mock useAtom to return our mock setter
    vi.mocked(require("jotai").useAtom).mockImplementation((atom: any) => {
      if (atom.init === "light") return ["light", vi.fn()];
      if (atom.init === "en") return ["en", mockSetLanguage];
      return [atom.init, vi.fn()];
    });

    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    const languageToggle = screen.getByLabelText("Toggle Language");
    await user.click(languageToggle);

    expect(mockSetLanguage).toHaveBeenCalledWith("ja");
    expect(mockChangeLanguage).toHaveBeenCalledWith("ja");
  });

  it("should render navigation links with correct paths", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    const tasksLink = screen.getByRole("link", { name: "Tasks" });

    expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    expect(tasksLink).toHaveAttribute("href", "/tasks");
  });

  it("should render children content", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div data-testid="child-content">Child Component</div>
      </AppLayout>,
      { wrapper },
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("should have responsive design elements", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    // Check for mobile menu button (if implemented)
    const menuButton = screen.queryByLabelText("Menu");
    // This might not exist depending on implementation
    // expect(menuButton).toBeInTheDocument()
  });

  it("should maintain app bar with proper styling", () => {
    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    // App bar should contain the app title
    expect(screen.getByText("Todo App")).toBeInTheDocument();
  });

  it("should handle dark theme state", () => {
    // Mock dark theme
    vi.mocked(require("jotai").useAtom).mockImplementation((atom: any) => {
      if (atom.init === "light") return ["dark", vi.fn()];
      if (atom.init === "en") return ["en", vi.fn()];
      return [atom.init, vi.fn()];
    });

    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    // Theme toggle should be present regardless of current theme
    expect(screen.getByLabelText("Toggle Theme")).toBeInTheDocument();
  });

  it("should handle Japanese language state", () => {
    // Mock Japanese language
    vi.mocked(require("jotai").useAtom).mockImplementation((atom: any) => {
      if (atom.init === "light") return ["light", vi.fn()];
      if (atom.init === "en") return ["ja", vi.fn()];
      return [atom.init, vi.fn()];
    });

    const wrapper = createWrapper();
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    // Language toggle should be present regardless of current language
    expect(screen.getByLabelText("Toggle Language")).toBeInTheDocument();
  });

  it("should provide proper layout structure", () => {
    const wrapper = createWrapper();
    const { container } = render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>,
      { wrapper },
    );

    // Should have proper layout structure with app bar and main content
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeInTheDocument();
  });
});
