import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import React from "react";
import { TaskForm } from "../TaskForm";
import type { Task } from "../../../types";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "task.editTask": "Edit Task",
        "task.createTask": "Create Task",
        "task.title": "Title",
        "task.description": "Description",
        "task.status": "Status",
        "task.priority": "Priority",
        "task.dueDate": "Due Date",
        "task.tags": "Tags",
        "task.addTag": "Add tag",
        "status.pending": "Pending",
        "status.in_progress": "In Progress",
        "status.completed": "Completed",
        "priority.low": "Low",
        "priority.medium": "Medium",
        "priority.high": "High",
        "form.cancel": "Cancel",
        "form.save": "Save",
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock useTasks hook
const mockCreateTask = vi.fn();
const mockUpdateTask = vi.fn();

vi.mock("../../../hooks/useTasks", () => ({
  useTasks: () => ({
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
  }),
}));

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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {children}
        </LocalizationProvider>
      </Provider>
    </QueryClientProvider>
  );
};

describe("TaskForm", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create task form", () => {
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("should render edit task form with prefilled values", () => {
    const task: Task = {
      id: "1",
      title: "Test Task",
      description: "Test description",
      status: "in_progress",
      priority: "high",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ["work", "urgent"],
    };

    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} task={task} />, { wrapper });

    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });
  });

  it("should create a new task", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const saveButton = screen.getByRole("button", { name: "Save" });

    await user.type(titleInput, "New Task");
    await user.type(descriptionInput, "New description");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: "New Task",
        description: "New description",
        status: "pending",
        priority: "medium",
        dueDate: undefined,
        tags: [],
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it("should update an existing task", async () => {
    const user = userEvent.setup();
    const task: Task = {
      id: "1",
      title: "Original Task",
      description: "Original description",
      status: "pending",
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    };

    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} task={task} />, { wrapper });

    const titleInput = screen.getByDisplayValue("Original Task");
    const saveButton = screen.getByRole("button", { name: "Save" });

    await user.clear(titleInput);
    await user.type(titleInput, "Updated Task");
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith({
        id: "1",
        updates: {
          title: "Updated Task",
          description: "Original description",
          status: "pending",
          priority: "medium",
          dueDate: undefined,
          tags: [],
        },
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it("should handle cancel button click", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("should change status and priority", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    // Click status dropdown
    const statusSelect = screen.getByLabelText("Status");
    await user.click(statusSelect);

    // Select "In Progress"
    const inProgressOption = screen.getByText("In Progress");
    await user.click(inProgressOption);

    // Click priority dropdown
    const prioritySelect = screen.getByLabelText("Priority");
    await user.click(prioritySelect);

    // Select "High"
    const highOption = screen.getByText("High");
    await user.click(highOption);

    // Fill required title and submit
    const titleInput = screen.getByLabelText("Title");
    await user.type(titleInput, "Test Task");

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "in_progress",
          priority: "high",
        }),
      );
    });
  });

  it("should handle tags input", async () => {
    const user = userEvent.setup();
    const wrapper = createWrapper();
    render(<TaskForm {...defaultProps} />, { wrapper });

    const tagsInput = screen.getByLabelText("Tags");
    await user.type(tagsInput, "work{enter}");
    await user.type(tagsInput, "urgent{enter}");

    const titleInput = screen.getByLabelText("Title");
    await user.type(titleInput, "Test Task");

    const saveButton = screen.getByRole("button", { name: "Save" });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ["work", "urgent"],
        }),
      );
    });
  });
});
