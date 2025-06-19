import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";
import React from "react";
import { TaskCard } from "../TaskCard";
import type { Task } from "../../../types";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "task.edit": "Edit",
        "task.delete": "Delete",
        "task.duplicate": "Duplicate",
        "task.markCompleted": "Mark as Completed",
        "task.viewDetails": "View Details",
        "status.pending": "Pending",
        "status.in_progress": "In Progress",
        "status.completed": "Completed",
        "priority.low": "Low",
        "priority.medium": "Medium",
        "priority.high": "High",
        "common.overdue": "Overdue",
        "common.dueToday": "Due Today",
        "common.noDescription": "No description",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const theme = createTheme();

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );
};

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "Test description",
    status: "pending",
    priority: "medium",
    dueDate: new Date("2024-01-20T10:00:00Z"),
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
    tags: ["work", "urgent"],
  };

  const defaultProps = {
    task: mockTask,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
    onToggleComplete: vi.fn(),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render task information correctly", () => {
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("urgent")).toBeInTheDocument();
  });

  it("should handle edit button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const editButton = screen.getByLabelText("Edit");
    await user.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it("should handle delete button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const deleteButton = screen.getByLabelText("Delete");
    await user.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith("1");
  });

  it("should handle duplicate button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const duplicateButton = screen.getByLabelText("Duplicate");
    await user.click(duplicateButton);

    expect(defaultProps.onDuplicate).toHaveBeenCalledWith("1");
  });

  it("should handle toggle complete button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const toggleButton = screen.getByLabelText("Mark as Completed");
    await user.click(toggleButton);

    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith("1");
  });

  it("should handle card click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const card = screen.getByRole("article");
    await user.click(card);

    expect(defaultProps.onClick).toHaveBeenCalledWith(mockTask);
  });

  it("should display overdue status for past due dates", () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: new Date("2024-01-10T10:00:00Z"), // Past date
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={overdueTask} />, { wrapper });

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("should display due today status", () => {
    const todayTask: Task = {
      ...mockTask,
      dueDate: new Date("2024-01-15T15:00:00Z"), // Today
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={todayTask} />, { wrapper });

    expect(screen.getByText("Due Today")).toBeInTheDocument();
  });

  it("should render task without description", () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: undefined,
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={taskWithoutDescription} />, {
      wrapper,
    });

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("should render task without due date", () => {
    const taskWithoutDueDate: Task = {
      ...mockTask,
      dueDate: undefined,
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={taskWithoutDueDate} />, {
      wrapper,
    });

    // Should not show any due date information
    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
    expect(screen.queryByText("Due Today")).not.toBeInTheDocument();
  });

  it("should render task without tags", () => {
    const taskWithoutTags: Task = {
      ...mockTask,
      tags: [],
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={taskWithoutTags} />, { wrapper });

    expect(screen.queryByText("work")).not.toBeInTheDocument();
    expect(screen.queryByText("urgent")).not.toBeInTheDocument();
  });

  it("should display correct status styling for completed tasks", () => {
    const completedTask: Task = {
      ...mockTask,
      status: "completed",
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={completedTask} />, { wrapper });

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should display correct status styling for in progress tasks", () => {
    const inProgressTask: Task = {
      ...mockTask,
      status: "in_progress",
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={inProgressTask} />, { wrapper });

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should display correct priority styling for high priority", () => {
    const highPriorityTask: Task = {
      ...mockTask,
      priority: "high",
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={highPriorityTask} />, { wrapper });

    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("should display correct priority styling for low priority", () => {
    const lowPriorityTask: Task = {
      ...mockTask,
      priority: "low",
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={lowPriorityTask} />, { wrapper });

    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("should handle multiple tags correctly", () => {
    const taskWithManyTags: Task = {
      ...mockTask,
      tags: ["work", "urgent", "meeting", "important"],
    };

    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} task={taskWithManyTags} />, { wrapper });

    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("urgent")).toBeInTheDocument();
    expect(screen.getByText("meeting")).toBeInTheDocument();
    expect(screen.getByText("important")).toBeInTheDocument();
  });

  it("should prevent button clicks from triggering card click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    const editButton = screen.getByLabelText("Edit");
    await user.click(editButton);

    // onEdit should be called but onClick should not be called
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTask);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it("should show appropriate action buttons based on task status", () => {
    const wrapper = createWrapper();
    render(<TaskCard {...defaultProps} />, { wrapper });

    // For pending tasks, should show mark as completed button
    expect(screen.getByLabelText("Mark as Completed")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete")).toBeInTheDocument();
    expect(screen.getByLabelText("Duplicate")).toBeInTheDocument();
  });
});
