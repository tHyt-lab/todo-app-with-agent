import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import React from "react";
import { Dashboard } from "../Dashboard";
import type { Task } from "../../../types";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "dashboard.title": "Dashboard",
        "dashboard.overview": "Task Overview",
        "dashboard.totalTasks": "Total Tasks",
        "dashboard.pendingTasks": "Pending Tasks",
        "dashboard.completedTasks": "Completed Tasks",
        "dashboard.overdueTasks": "Overdue Tasks",
        "dashboard.tasksDueToday": "Tasks Due Today",
        "dashboard.completionRate": "Completion Rate",
        "dashboard.recentTasks": "Recent Tasks",
        "dashboard.noTasks": "No tasks found",
        "dashboard.quickActions": "Quick Actions",
        "dashboard.createTask": "Create New Task",
        "dashboard.viewAllTasks": "View All Tasks",
        "common.noData": "No data available",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock useTasks hook
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Pending Task",
    status: "pending",
    priority: "medium",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
    tags: [],
  },
  {
    id: "2",
    title: "In Progress Task",
    status: "in_progress",
    priority: "high",
    createdAt: new Date("2024-01-14T10:00:00Z"),
    updatedAt: new Date("2024-01-14T10:00:00Z"),
    tags: [],
  },
  {
    id: "3",
    title: "Completed Task",
    status: "completed",
    priority: "low",
    createdAt: new Date("2024-01-13T10:00:00Z"),
    updatedAt: new Date("2024-01-13T10:00:00Z"),
    tags: [],
  },
  {
    id: "4",
    title: "Overdue Task",
    status: "pending",
    priority: "high",
    dueDate: new Date("2024-01-10T10:00:00Z"), // Past date
    createdAt: new Date("2024-01-12T10:00:00Z"),
    updatedAt: new Date("2024-01-12T10:00:00Z"),
    tags: [],
  },
  {
    id: "5",
    title: "Due Today Task",
    status: "pending",
    priority: "medium",
    dueDate: new Date("2024-01-15T15:00:00Z"), // Today
    createdAt: new Date("2024-01-11T10:00:00Z"),
    updatedAt: new Date("2024-01-11T10:00:00Z"),
    tags: [],
  },
];

const mockGetTasksByStatus = vi.fn();
const mockGetOverdueTasks = vi.fn();
const mockGetTasksDueToday = vi.fn();

vi.mock("../../../hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: mockTasks,
    getTasksByStatus: mockGetTasksByStatus,
    getOverdueTasks: mockGetOverdueTasks,
    getTasksDueToday: mockGetTasksDueToday,
  }),
}));

// Mock Chart.js to avoid canvas errors in tests
vi.mock("react-chartjs-2", () => ({
  Doughnut: ({ data }: any) => (
    <div data-testid="chart">Chart: {data.labels.join(", ")}</div>
  ),
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
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up fake timers for consistent date testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    // Setup mock return values
    mockGetTasksByStatus.mockImplementation((status) => {
      return mockTasks.filter((task) => task.status === status);
    });

    mockGetOverdueTasks.mockReturnValue([mockTasks[3]]); // Overdue task
    mockGetTasksDueToday.mockReturnValue([mockTasks[4]]); // Due today task
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render dashboard title", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should display task statistics correctly", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Total tasks

    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Pending tasks (including overdue)

    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Completed tasks

    expect(screen.getByText("Overdue Tasks")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Overdue tasks

    expect(screen.getByText("Tasks Due Today")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Due today tasks
  });

  it("should calculate completion rate correctly", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument(); // 1 completed out of 5 total = 20%
  });

  it("should display chart with task distribution", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    const chart = screen.getByTestId("chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveTextContent("Pending, In Progress, Completed");
  });

  it("should handle empty task list", () => {
    // Mock empty tasks
    vi.mocked(mockGetTasksByStatus).mockReturnValue([]);
    vi.mocked(mockGetOverdueTasks).mockReturnValue([]);
    vi.mocked(mockGetTasksDueToday).mockReturnValue([]);

    // Override the mock to return empty array
    vi.doMock("../../../hooks/useTasks", () => ({
      useTasks: () => ({
        tasks: [],
        getTasksByStatus: () => [],
        getOverdueTasks: () => [],
        getTasksDueToday: () => [],
      }),
    }));

    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("0")).toBeInTheDocument(); // Should show zeros for all stats
  });

  it("should display recent tasks section", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Recent Tasks")).toBeInTheDocument();

    // Check if recent tasks are displayed (should show some task titles)
    expect(screen.getByText("Pending Task")).toBeInTheDocument();
    expect(screen.getByText("In Progress Task")).toBeInTheDocument();
  });

  it("should display quick actions", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    expect(screen.getByText("Create New Task")).toBeInTheDocument();
    expect(screen.getByText("View All Tasks")).toBeInTheDocument();
  });

  it("should handle completion rate with no tasks", () => {
    vi.doMock("../../../hooks/useTasks", () => ({
      useTasks: () => ({
        tasks: [],
        getTasksByStatus: () => [],
        getOverdueTasks: () => [],
        getTasksDueToday: () => [],
      }),
    }));

    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    // Should show 0% completion rate when no tasks exist
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("should display task overview section", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Task Overview")).toBeInTheDocument();
  });

  it("should show correct status distribution", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    // Verify that the status counts are correct
    // Pending: 2 tasks (including overdue)
    // In Progress: 1 task
    // Completed: 1 task

    const pendingElements = screen.getAllByText("2");
    const inProgressElements = screen.getAllByText("1");

    expect(pendingElements.length).toBeGreaterThan(0);
    expect(inProgressElements.length).toBeGreaterThan(0);
  });

  it("should handle tasks with different priorities", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    // All tasks should be counted regardless of priority
    expect(screen.getByText("5")).toBeInTheDocument(); // Total tasks
  });

  it("should display overdue tasks correctly", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Overdue Tasks")).toBeInTheDocument();
    expect(mockGetOverdueTasks).toHaveBeenCalled();
  });

  it("should display due today tasks correctly", () => {
    const wrapper = createWrapper();
    render(<Dashboard />, { wrapper });

    expect(screen.getByText("Tasks Due Today")).toBeInTheDocument();
    expect(mockGetTasksDueToday).toHaveBeenCalled();
  });
});
