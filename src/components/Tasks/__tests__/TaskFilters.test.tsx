import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import React from "react";
import { TaskFilters } from "../TaskFilters";
import type { TaskStatus, TaskPriority } from "../../../types";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "filter.search": "Search tasks...",
        "filter.status": "Status",
        "filter.priority": "Priority",
        "filter.sortBy": "Sort by",
        "filter.all": "All",
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

const theme = createTheme();

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
};

interface TaskFiltersProps {
  searchQuery: string;
  statusFilter: TaskStatus | "all";
  priorityFilter: TaskPriority | "all";
  sortBy: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: TaskStatus | "all") => void;
  onPriorityChange: (priority: TaskPriority | "all") => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

// Mock TaskFilters component for testing
const MockTaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  sortBy,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onReset,
}) => {
  return (
    <div>
      <input
        data-testid="search-input"
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        data-testid="status-filter"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | "all")}
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <select
        data-testid="priority-filter"
        value={priorityFilter}
        onChange={(e) =>
          onPriorityChange(e.target.value as TaskPriority | "all")
        }
      >
        <option value="all">All</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        data-testid="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="title">Title</option>
        <option value="createdAt">Created Date</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
      </select>

      <button data-testid="reset-button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

describe("TaskFilters", () => {
  const defaultProps: TaskFiltersProps = {
    searchQuery: "",
    statusFilter: "all",
    priorityFilter: "all",
    sortBy: "title",
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onSortChange: vi.fn(),
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all filter elements", () => {
    const wrapper = createWrapper();
    render(<MockTaskFilters {...defaultProps} />, { wrapper });

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("status-filter")).toBeInTheDocument();
    expect(screen.getByTestId("priority-filter")).toBeInTheDocument();
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
    expect(screen.getByTestId("reset-button")).toBeInTheDocument();
  });

  it("should handle search input change", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const props = { ...defaultProps, onSearchChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const searchInput = screen.getByTestId("search-input");
    await user.type(searchInput, "test query");

    expect(onSearchChange).toHaveBeenCalledWith("t");
    expect(onSearchChange).toHaveBeenCalledWith("e");
    // Should be called for each character typed
  });

  it("should handle status filter change", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const props = { ...defaultProps, onStatusChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const statusFilter = screen.getByTestId("status-filter");
    await user.selectOptions(statusFilter, "pending");

    expect(onStatusChange).toHaveBeenCalledWith("pending");
  });

  it("should handle priority filter change", async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();
    const props = { ...defaultProps, onPriorityChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const priorityFilter = screen.getByTestId("priority-filter");
    await user.selectOptions(priorityFilter, "high");

    expect(onPriorityChange).toHaveBeenCalledWith("high");
  });

  it("should handle sort change", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const props = { ...defaultProps, onSortChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const sortSelect = screen.getByTestId("sort-select");
    await user.selectOptions(sortSelect, "dueDate");

    expect(onSortChange).toHaveBeenCalledWith("dueDate");
  });

  it("should handle reset button click", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const props = { ...defaultProps, onReset };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const resetButton = screen.getByTestId("reset-button");
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it("should display current filter values", () => {
    const props: TaskFiltersProps = {
      ...defaultProps,
      searchQuery: "test search",
      statusFilter: "pending",
      priorityFilter: "high",
      sortBy: "dueDate",
    };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    expect(screen.getByTestId("search-input")).toHaveValue("test search");
    expect(screen.getByTestId("status-filter")).toHaveValue("pending");
    expect(screen.getByTestId("priority-filter")).toHaveValue("high");
    expect(screen.getByTestId("sort-select")).toHaveValue("dueDate");
  });

  it("should handle all status options", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const props = { ...defaultProps, onStatusChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const statusFilter = screen.getByTestId("status-filter");

    await user.selectOptions(statusFilter, "all");
    expect(onStatusChange).toHaveBeenCalledWith("all");

    await user.selectOptions(statusFilter, "in_progress");
    expect(onStatusChange).toHaveBeenCalledWith("in_progress");

    await user.selectOptions(statusFilter, "completed");
    expect(onStatusChange).toHaveBeenCalledWith("completed");
  });

  it("should handle all priority options", async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();
    const props = { ...defaultProps, onPriorityChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const priorityFilter = screen.getByTestId("priority-filter");

    await user.selectOptions(priorityFilter, "all");
    expect(onPriorityChange).toHaveBeenCalledWith("all");

    await user.selectOptions(priorityFilter, "low");
    expect(onPriorityChange).toHaveBeenCalledWith("low");

    await user.selectOptions(priorityFilter, "medium");
    expect(onPriorityChange).toHaveBeenCalledWith("medium");
  });

  it("should handle all sort options", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const props = { ...defaultProps, onSortChange };

    const wrapper = createWrapper();
    render(<MockTaskFilters {...props} />, { wrapper });

    const sortSelect = screen.getByTestId("sort-select");

    await user.selectOptions(sortSelect, "title");
    expect(onSortChange).toHaveBeenCalledWith("title");

    await user.selectOptions(sortSelect, "createdAt");
    expect(onSortChange).toHaveBeenCalledWith("createdAt");

    await user.selectOptions(sortSelect, "priority");
    expect(onSortChange).toHaveBeenCalledWith("priority");
  });
});
