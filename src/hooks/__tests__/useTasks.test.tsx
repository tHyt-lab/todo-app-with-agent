import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import React from "react";
import { useTasks } from "../useTasks";
import type { Task, CreateTask } from "../../types";

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider>{children}</Provider>
    </QueryClientProvider>
  );
};

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it("should initialize with empty tasks", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should create a new task", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const newTask: CreateTask = {
      title: "Test Task",
      description: "Test description",
      status: "pending",
      priority: "medium",
      tags: ["test"],
    };

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe("Test Task");
      expect(result.current.tasks[0].id).toBeDefined();
      expect(result.current.tasks[0].createdAt).toBeInstanceOf(Date);
      expect(result.current.tasks[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  it("should update an existing task", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    // Create a task first
    const newTask: CreateTask = {
      title: "Original Task",
      status: "pending",
      priority: "medium",
      tags: [],
    };

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;
    const updates = { title: "Updated Task", status: "completed" as const };

    await act(async () => {
      result.current.updateTask({ id: taskId, updates });
    });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe("Updated Task");
      expect(result.current.tasks[0].status).toBe("completed");
    });
  });

  it("should delete a task", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    // Create a task first
    const newTask: CreateTask = {
      title: "Task to Delete",
      status: "pending",
      priority: "medium",
      tags: [],
    };

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;

    await act(async () => {
      result.current.deleteTask(taskId);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  it("should reorder tasks", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    // Create multiple tasks
    const task1: CreateTask = {
      title: "Task 1",
      status: "pending",
      priority: "medium",
      tags: [],
    };
    const task2: CreateTask = {
      title: "Task 2",
      status: "pending",
      priority: "medium",
      tags: [],
    };

    await act(async () => {
      result.current.createTask(task1);
    });
    await act(async () => {
      result.current.createTask(task2);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
    });

    const reorderedTasks = [result.current.tasks[1], result.current.tasks[0]];

    await act(async () => {
      result.current.reorderTasks(reorderedTasks);
    });

    await waitFor(() => {
      expect(result.current.tasks[0].title).toBe("Task 2");
      expect(result.current.tasks[1].title).toBe("Task 1");
    });
  });

  it("should duplicate a task", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const newTask: CreateTask = {
      title: "Original Task",
      description: "Original description",
      status: "pending",
      priority: "high",
      tags: ["original"],
    };

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;

    await act(async () => {
      result.current.duplicateTask(taskId);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[1].title).toBe("Original Task (Copy)");
      expect(result.current.tasks[1].description).toBe("Original description");
      expect(result.current.tasks[1].priority).toBe("high");
      expect(result.current.tasks[1].id).not.toBe(taskId);
    });
  });

  it("should get task by ID", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const newTask: CreateTask = {
      title: "Test Task",
      status: "pending",
      priority: "medium",
      tags: [],
    };

    await act(async () => {
      result.current.createTask(newTask);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const taskId = result.current.tasks[0].id;
    const foundTask = result.current.getTaskById(taskId);

    expect(foundTask).toBeDefined();
    expect(foundTask?.title).toBe("Test Task");

    const notFoundTask = result.current.getTaskById("non-existent-id");
    expect(notFoundTask).toBeUndefined();
  });

  it("should get tasks by status", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const pendingTask: CreateTask = {
      title: "Pending Task",
      status: "pending",
      priority: "medium",
      tags: [],
    };
    const completedTask: CreateTask = {
      title: "Completed Task",
      status: "completed",
      priority: "medium",
      tags: [],
    };

    await act(async () => {
      await result.current.createTask(pendingTask);
    });

    await act(async () => {
      await result.current.createTask(completedTask);
    });

    await waitFor(
      () => {
        expect(result.current.tasks).toHaveLength(2);
      },
      { timeout: 10000 },
    );

    const pendingTasks = result.current.getTasksByStatus("pending");
    const completedTasks = result.current.getTasksByStatus("completed");

    expect(pendingTasks).toHaveLength(1);
    expect(pendingTasks[0].title).toBe("Pending Task");
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].title).toBe("Completed Task");
  });

  it("should get overdue tasks", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const overdueTask: CreateTask = {
      title: "Overdue Task",
      status: "pending",
      priority: "medium",
      dueDate: new Date("2024-01-10T10:00:00Z"), // Past date
      tags: [],
    };

    const futureTask: CreateTask = {
      title: "Future Task",
      status: "pending",
      priority: "medium",
      dueDate: new Date("2024-01-20T10:00:00Z"), // Future date
      tags: [],
    };

    await act(async () => {
      await result.current.createTask(overdueTask);
    });

    await act(async () => {
      await result.current.createTask(futureTask);
    });

    await waitFor(
      () => {
        expect(result.current.tasks).toHaveLength(2);
      },
      { timeout: 10000 },
    );

    const overdueTasks = result.current.getOverdueTasks();
    expect(overdueTasks).toHaveLength(1);
    expect(overdueTasks[0].title).toBe("Overdue Task");

    vi.useRealTimers();
  });

  it("should get tasks due today", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useTasks(), { wrapper });

    const todayTask: CreateTask = {
      title: "Today Task",
      status: "pending",
      priority: "medium",
      dueDate: new Date("2024-01-15T15:00:00Z"), // Today
      tags: [],
    };

    const tomorrowTask: CreateTask = {
      title: "Tomorrow Task",
      status: "pending",
      priority: "medium",
      dueDate: new Date("2024-01-16T10:00:00Z"), // Tomorrow
      tags: [],
    };

    await act(async () => {
      await result.current.createTask(todayTask);
    });

    await act(async () => {
      await result.current.createTask(tomorrowTask);
    });

    await waitFor(
      () => {
        expect(result.current.tasks).toHaveLength(2);
      },
      { timeout: 10000 },
    );

    const todayTasks = result.current.getTasksDueToday();
    expect(todayTasks).toHaveLength(1);
    expect(todayTasks[0].title).toBe("Today Task");

    vi.useRealTimers();
  });
});
