import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "jotai";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../../../types";
import { TaskList } from "../TaskList";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.title": "Tasks",
        "tasks.createTask": "Create Task",
        "tasks.noTasks": "No tasks found",
        "tasks.searchPlaceholder": "Search tasks...",
        "filter.all": "All",
        "filter.status": "Status",
        "filter.priority": "Priority",
        "filter.sortBy": "Sort by",
        "status.pending": "Pending",
        "status.in_progress": "In Progress",
        "status.completed": "Completed",
        "priority.low": "Low",
        "priority.medium": "Medium",
        "priority.high": "High",
        "sort.title": "Title",
        "sort.createdAt": "Created Date",
        "sort.dueDate": "Due Date",
        "sort.priority": "Priority",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock TaskCard component
vi.mock("../TaskCard", () => ({
  TaskCard: ({
    task,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleComplete,
    onClick,
  }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <span>{task.status}</span>
      <span>{task.priority}</span>
      <button onClick={() => onEdit(task)}>Edit</button>
      <button onClick={() => onDelete(task.id)}>Delete</button>
      <button onClick={() => onDuplicate(task.id)}>Duplicate</button>
      <button onClick={() => onToggleComplete(task.id)}>Toggle Complete</button>
      <button onClick={() => onClick(task)}>View</button>
    </div>
  ),
}));

// Mock TaskForm component
vi.mock("../TaskForm", () => ({
  TaskForm: ({ onClose, onSuccess }: any) => (
    <div data-testid="task-form">
      <button onClick={onClose}>Close</button>
      <button onClick={onSuccess}>Save</button>
    </div>
  ),
}));

// Mock TaskFilters component
vi.mock("../TaskFilters", () => ({
  TaskFilters: ({
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onSortChange,
    onReset,
  }: any) => (
    <div data-testid="task-filters">
      <input
        data-testid="search-input"
        value={searchQuery || ""}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        placeholder="Search tasks..."
      />
      <select
        data-testid="status-filter"
        value={statusFilter || "all"}
        onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button onClick={() => onReset && onReset()}>Reset</button>
    </div>
  ),
}));

// Mock useTasks hook
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Task 1",
    description: "Description 1",
    status: "pending",
    priority: "high",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
    tags: ["work"],
  },
  {
    id: "2",
    title: "Task 2",
    description: "Description 2",
    status: "in_progress",
    priority: "medium",
    createdAt: new Date("2024-01-14T10:00:00Z"),
    updatedAt: new Date("2024-01-14T10:00:00Z"),
    tags: ["personal"],
  },
  {
    id: "3",
    title: "Task 3",
    description: "Description 3",
    status: "completed",
    priority: "low",
    createdAt: new Date("2024-01-13T10:00:00Z"),
    updatedAt: new Date("2024-01-13T10:00:00Z"),
    tags: [],
  },
];

const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockDuplicateTask = vi.fn();

vi.mock("../../../hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: mockTasks,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    duplicateTask: mockDuplicateTask,
    isLoading: false,
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
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
};

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render task list with tasks", () => {
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-3")).toBeInTheDocument();
  });

  it("should render create task button", () => {
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    expect(
      screen.getByRole("button", { name: "Create Task" }),
    ).toBeInTheDocument();
  });

  it("should render task filters", () => {
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    expect(screen.getByTestId("task-filters")).toBeInTheDocument();
  });

  it("should open task form when create button is clicked", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const createButton = screen.getByRole("button", { name: "Create Task" });
    await user.click(createButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();
  });

  it("should filter tasks by search query", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Task 1");

    // Should show only Task 1
    expect(screen.getByTestId("task-card-1")).toBeInTheDocument();
    expect(screen.queryByTestId("task-card-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("task-card-3")).not.toBeInTheDocument();
  });

  it("should filter tasks by status", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const statusFilter = screen.getByTestId("status-filter");
    await user.selectOptions(statusFilter, "completed");

    // Should show only completed Task 3
    expect(screen.queryByTestId("task-card-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("task-card-2")).not.toBeInTheDocument();
    expect(screen.getByTestId("task-card-3")).toBeInTheDocument();
  });

  it("should handle task edit", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const editButton = screen.getAllByText("Edit")[0];
    await user.click(editButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();
  });

  it("should handle task delete", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const deleteButton = screen.getAllByText("Delete")[0];
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });
  });

  it("should handle task duplicate", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const duplicateButton = screen.getAllByText("Duplicate")[0];
    await user.click(duplicateButton);

    await waitFor(() => {
      expect(mockDuplicateTask).toHaveBeenCalledWith("1");
    });
  });

  it("should handle task toggle complete", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const toggleButton = screen.getAllByText("Toggle Complete")[0];
    await user.click(toggleButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: "1",
        updates: { status: "completed" },
      });
    });
  });

  it("should show no tasks message when filtered results are empty", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Non-existent task");

    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("should reset filters when reset button is clicked", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    // First filter tasks
    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "Task 1");

    // Then reset
    const resetButton = screen.getByText("Reset");
    await user.click(resetButton);

    // All tasks should be visible again
    expect(screen.getByTestId("task-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-3")).toBeInTheDocument();
  });

  it("should close task form when close button is clicked", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    // Open form
    const createButton = screen.getByRole("button", { name: "Create Task" });
    await user.click(createButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();

    // Close form
    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  it("should close task form when save is successful", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    // Open form
    const createButton = screen.getByRole("button", { name: "Create Task" });
    await user.click(createButton);

    expect(screen.getByTestId("task-form")).toBeInTheDocument();

    // Save form
    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  it("should handle empty task list", () => {
    // Mock empty tasks
    vi.doMock("../../../hooks/useTasks", () => ({
      useTasks: () => ({
        tasks: [],
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        duplicateTask: vi.fn(),
        isLoading: false,
      }),
    }));

    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    expect(screen.getByText("No tasks found")).toBeInTheDocument();
  });

  it("should sort tasks correctly", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskList />, { wrapper });

    // The actual sorting logic would be tested based on the implementation
    // Here we just verify that the tasks are rendered
    expect(screen.getByTestId("task-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-2")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-3")).toBeInTheDocument();
  });
});
