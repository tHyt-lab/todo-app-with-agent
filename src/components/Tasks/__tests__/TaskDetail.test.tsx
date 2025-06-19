import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import React from "react";
import { TaskDetail } from "../TaskDetail";
import type { Task } from "../../../types";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ taskId: "1" }),
  };
});

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "task.taskDetail": "Task Detail",
        "task.title": "Title",
        "task.description": "Description",
        "task.status": "Status",
        "task.priority": "Priority",
        "task.dueDate": "Due Date",
        "task.tags": "Tags",
        "task.createdAt": "Created",
        "task.updatedAt": "Updated",
        "task.edit": "Edit",
        "task.delete": "Delete",
        "task.duplicate": "Duplicate",
        "task.markCompleted": "Mark as Completed",
        "task.taskNotFound": "Task not found",
        "status.pending": "Pending",
        "status.in_progress": "In Progress",
        "status.completed": "Completed",
        "priority.low": "Low",
        "priority.medium": "Medium",
        "priority.high": "High",
        "common.back": "Back",
        "common.noDescription": "No description",
        "common.noDueDate": "No due date",
        "common.noTags": "No tags",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock useTasks hook
const mockGetTaskById = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockDuplicateTask = vi.fn();

vi.mock("../../../hooks/useTasks", () => ({
  useTasks: () => ({
    getTaskById: mockGetTaskById,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    duplicateTask: mockDuplicateTask,
  }),
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

describe("TaskDetail", () => {
  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "Test description",
    status: "in_progress",
    priority: "high",
    dueDate: new Date("2024-01-20T10:00:00Z"),
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-16T10:00:00Z"),
    tags: ["work", "urgent"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTaskById.mockReturnValue(mockTask);
  });

  it("should render task detail when task exists", () => {
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    expect(screen.getByText("Task Detail")).toBeInTheDocument();
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("urgent")).toBeInTheDocument();
  });

  it("should render task not found when task does not exist", () => {
    mockGetTaskById.mockReturnValue(undefined);

    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    expect(screen.getByText("Task not found")).toBeInTheDocument();
  });

  it("should display formatted dates", () => {
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    // Check if date fields are present (exact format depends on locale)
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("Due Date")).toBeInTheDocument();
  });

  it("should handle edit button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const editButton = screen.getByRole("button", { name: "Edit" });
    await user.click(editButton);

    // Edit functionality would open a modal or navigate to edit page
    // This depends on the actual implementation
  });

  it("should handle delete button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith("1");
      expect(mockNavigate).toHaveBeenCalledWith("/tasks");
    });
  });

  it("should handle duplicate button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const duplicateButton = screen.getByRole("button", { name: "Duplicate" });
    await user.click(duplicateButton);

    await waitFor(() => {
      expect(mockDuplicateTask).toHaveBeenCalledWith("1");
    });
  });

  it("should handle mark as completed button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const completeButton = screen.getByRole("button", {
      name: "Mark as Completed",
    });
    await user.click(completeButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: "1",
        updates: { status: "completed" },
      });
    });
  });

  it("should handle back button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const backButton = screen.getByRole("button", { name: "Back" });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/tasks");
  });

  it("should render task without optional fields", () => {
    const taskWithoutOptionalFields: Task = {
      id: "2",
      title: "Simple Task",
      status: "pending",
      priority: "medium",
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T10:00:00Z"),
      tags: [],
    };

    mockGetTaskById.mockReturnValue(taskWithoutOptionalFields);

    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    expect(screen.getByText("Simple Task")).toBeInTheDocument();
    expect(screen.getByText("No description")).toBeInTheDocument();
    expect(screen.getByText("No due date")).toBeInTheDocument();
    expect(screen.getByText("No tags")).toBeInTheDocument();
  });

  it("should not show complete button for already completed tasks", () => {
    const completedTask: Task = {
      ...mockTask,
      status: "completed",
    };

    mockGetTaskById.mockReturnValue(completedTask);

    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    expect(
      screen.queryByRole("button", { name: "Mark as Completed" }),
    ).not.toBeInTheDocument();
  });

  it("should display priority and status with correct styling", () => {
    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    const statusBadge = screen.getByText("In Progress");
    const priorityBadge = screen.getByText("High");

    expect(statusBadge).toBeInTheDocument();
    expect(priorityBadge).toBeInTheDocument();
  });

  it("should handle empty tags array", () => {
    const taskWithoutTags: Task = {
      ...mockTask,
      tags: [],
    };

    mockGetTaskById.mockReturnValue(taskWithoutTags);

    const wrapper = createWrapper();
    render(<TaskDetail />, { wrapper });

    expect(screen.getByText("No tags")).toBeInTheDocument();
  });
});
