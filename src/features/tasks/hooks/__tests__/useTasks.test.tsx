import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useTasks } from "../useTasks";
import type { CreateTask, Task, UpdateTask } from "@/features/tasks/types/task.types";

// Test utilities
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider>{children}</Provider>
    </QueryClientProvider>
  );
};

const createNewTask = (overrides: Partial<CreateTask> = {}): CreateTask => ({
  title: "New Task",
  description: "New Description",
  status: "pending",
  priority: "medium",
  ...overrides,
});

describe("useTasks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should return empty array initially", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should provide all expected methods and properties", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current).toMatchObject({
        tasks: expect.any(Array),
        isLoading: expect.any(Boolean),
        error: null,
        createTask: expect.any(Function),
        updateTask: expect.any(Function),
        deleteTask: expect.any(Function),
        reorderTasks: expect.any(Function),
        duplicateTask: expect.any(Function),
        getTaskById: expect.any(Function),
        getTasksByStatus: expect.any(Function),
        getTasksByPriority: expect.any(Function),
        getOverdueTasks: expect.any(Function),
        getTasksDueToday: expect.any(Function),
        isCreating: expect.any(Boolean),
        isUpdating: expect.any(Boolean),
        isDeleting: expect.any(Boolean),
        isReordering: expect.any(Boolean),
        isDuplicating: expect.any(Boolean),
      });
    });
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask();

      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const createdTask = result.current.tasks[0];
      expect(createdTask).toMatchObject({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        tags: [],
      });
      expect(createdTask.id).toBeTruthy();
      expect(createdTask.createdAt).toBeInstanceOf(Date);
      expect(createdTask.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle tags correctly when provided", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask({ tags: ["work", "urgent"] });

      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks[0].tags).toEqual(["work", "urgent"]);
        },
        { timeout: 1000 }
      );
    });

    it("should handle tags correctly when not provided", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask({ tags: undefined });

      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks[0].tags).toEqual([]);
        },
        { timeout: 1000 }
      );
    });

    it("should complete task creation", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask();

      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
          expect(result.current.isCreating).toBe(false);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("updateTask", () => {
    it("should update a task successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const taskId = result.current.tasks[0].id;
      const updates: UpdateTask = { title: "Updated Task" };

      result.current.updateTask({ id: taskId, updates });

      await waitFor(
        () => {
          expect(result.current.tasks[0].title).toBe("Updated Task");
          expect(result.current.tasks[0].updatedAt).toBeInstanceOf(Date);
        },
        { timeout: 1000 }
      );
    });

    it("should not modify tasks if id not found", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const originalTask = result.current.tasks[0];
      const updates: UpdateTask = { title: "Updated Task" };

      result.current.updateTask({ id: "non-existent-id", updates });

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
          expect(result.current.tasks[0]).toEqual(originalTask);
        },
        { timeout: 1000 }
      );
    });

    it("should complete task update", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const taskId = result.current.tasks[0].id;
      const updates: UpdateTask = { title: "Updated Task" };

      result.current.updateTask({ id: taskId, updates });

      await waitFor(
        () => {
          expect(result.current.tasks[0].title).toBe("Updated Task");
          expect(result.current.isUpdating).toBe(false);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create two tasks
      const newTask1 = createNewTask({ title: "Task 1" });
      const newTask2 = createNewTask({ title: "Task 2" });

      result.current.createTask(newTask1);
      await waitFor(() => expect(result.current.tasks).toHaveLength(1), {
        timeout: 1000,
      });

      result.current.createTask(newTask2);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2), {
        timeout: 1000,
      });

      const taskIdToDelete = result.current.tasks[0].id;

      result.current.deleteTask(taskIdToDelete);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
          expect(
            result.current.tasks.find((task) => task.id === taskIdToDelete)
          ).toBeUndefined();
        },
        { timeout: 1000 }
      );
    });

    it("should not modify tasks if id not found", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const originalTasks = [...result.current.tasks];

      result.current.deleteTask("non-existent-id");

      await waitFor(
        () => {
          expect(result.current.tasks).toEqual(originalTasks);
        },
        { timeout: 1000 }
      );
    });

    it("should complete task deletion", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const taskId = result.current.tasks[0].id;

      result.current.deleteTask(taskId);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(0);
          expect(result.current.isDeleting).toBe(false);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("reorderTasks", () => {
    it("should reorder tasks successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create multiple tasks
      const tasks = [
        createNewTask({ title: "Task 1" }),
        createNewTask({ title: "Task 2" }),
        createNewTask({ title: "Task 3" }),
      ];

      for (const task of tasks) {
        result.current.createTask(task);
        await waitFor(
          () => {
            expect(result.current.tasks.length).toBeGreaterThan(0);
          },
          { timeout: 1000 }
        );
      }

      await waitFor(() => expect(result.current.tasks).toHaveLength(3), {
        timeout: 1000,
      });

      const reorderedTasks = [...result.current.tasks].reverse();

      result.current.reorderTasks(reorderedTasks);

      await waitFor(
        () => {
          expect(result.current.tasks).toEqual(reorderedTasks);
        },
        { timeout: 1000 }
      );
    });

    it("should complete task reordering", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const reorderedTasks = [...result.current.tasks];

      result.current.reorderTasks(reorderedTasks);

      await waitFor(
        () => {
          expect(result.current.isReordering).toBe(false);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("duplicateTask", () => {
    it("should duplicate a task successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask({
        title: "Original Task",
        description: "Original Description",
        tags: ["original"],
      });
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const originalTaskId = result.current.tasks[0].id;

      result.current.duplicateTask(originalTaskId);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(2);
        },
        { timeout: 1000 }
      );

      const originalTask = result.current.tasks.find(
        (task) => task.id === originalTaskId
      );
      const duplicatedTask = result.current.tasks.find(
        (task) => task.id !== originalTaskId
      );

      expect(duplicatedTask).toBeDefined();
      expect(duplicatedTask?.title).toBe("Original Task (Copy)");
      expect(duplicatedTask?.description).toBe(originalTask?.description);
      expect(duplicatedTask?.tags).toEqual(originalTask?.tags);
      expect(duplicatedTask?.id).not.toBe(originalTask?.id);
      expect(duplicatedTask?.createdAt).toBeInstanceOf(Date);
      expect(duplicatedTask?.updatedAt).toBeInstanceOf(Date);
    });

    it("should not duplicate non-existent task", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      result.current.duplicateTask("non-existent-id");

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(0);
        },
        { timeout: 1000 }
      );
    });

    it("should complete task duplication", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const taskId = result.current.tasks[0].id;

      result.current.duplicateTask(taskId);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(2);
          expect(result.current.isDuplicating).toBe(false);
        },
        { timeout: 1000 }
      );
    });
  });

  describe("helper functions", () => {
    it("should get task by id", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const newTask = createNewTask({ title: "Find Me" });
      result.current.createTask(newTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(1);
        },
        { timeout: 1000 }
      );

      const taskId = result.current.tasks[0].id;
      const foundTask = result.current.getTaskById(taskId);

      expect(foundTask).toBeDefined();
      expect(foundTask?.title).toBe("Find Me");
    });

    it("should return undefined for non-existent id", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const foundTask = result.current.getTaskById("non-existent");
      expect(foundTask).toBeUndefined();
    });

    it("should get tasks by status", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const pendingTask = createNewTask({ status: "pending" });
      const completedTask = createNewTask({ status: "completed" });

      result.current.createTask(pendingTask);
      result.current.createTask(completedTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(2);
        },
        { timeout: 1000 }
      );

      const pendingTasks = result.current.getTasksByStatus("pending");
      const completedTasks = result.current.getTasksByStatus("completed");

      expect(pendingTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
      expect(pendingTasks[0].status).toBe("pending");
      expect(completedTasks[0].status).toBe("completed");
    });

    it("should get tasks by priority", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const highTask = createNewTask({ priority: "high" });
      const lowTask = createNewTask({ priority: "low" });

      result.current.createTask(highTask);
      result.current.createTask(lowTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(2);
        },
        { timeout: 1000 }
      );

      const highTasks = result.current.getTasksByPriority("high");
      const lowTasks = result.current.getTasksByPriority("low");

      expect(highTasks).toHaveLength(1);
      expect(lowTasks).toHaveLength(1);
      expect(highTasks[0].priority).toBe("high");
      expect(lowTasks[0].priority).toBe("low");
    });

    it("should get overdue tasks", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const pastDate = new Date("2022-12-31T23:59:59Z");
      const futureDate = new Date("2023-12-31T23:59:59Z");

      const overdueTask = createNewTask({
        title: "Overdue Task",
        dueDate: pastDate,
        status: "pending",
      });
      const notOverdueTask = createNewTask({
        title: "Future Task",
        dueDate: futureDate,
        status: "pending",
      });
      const completedOverdueTask = createNewTask({
        title: "Completed Overdue",
        dueDate: pastDate,
        status: "completed",
      });

      result.current.createTask(overdueTask);
      result.current.createTask(notOverdueTask);
      result.current.createTask(completedOverdueTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(3);
        },
        { timeout: 1000 }
      );

      const overdueTasks = result.current.getOverdueTasks();

      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe("Overdue Task");
    });

    it("should get tasks due today", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Current time is set to 2023-01-01T00:00:00Z in beforeEach
      const todayDate = new Date("2023-01-01T12:00:00Z"); // Same day
      const yesterdayDate = new Date("2022-12-31T12:00:00Z");
      const tomorrowDate = new Date("2023-01-02T12:00:00Z");

      const todayTask = createNewTask({
        title: "Today Task",
        dueDate: todayDate,
      });
      const yesterdayTask = createNewTask({
        title: "Yesterday Task",
        dueDate: yesterdayDate,
      });
      const tomorrowTask = createNewTask({
        title: "Tomorrow Task",
        dueDate: tomorrowDate,
      });

      result.current.createTask(todayTask);
      result.current.createTask(yesterdayTask);
      result.current.createTask(tomorrowTask);

      await waitFor(
        () => {
          expect(result.current.tasks).toHaveLength(3);
        },
        { timeout: 1000 }
      );

      const tasksDueToday = result.current.getTasksDueToday();

      expect(tasksDueToday).toHaveLength(1);
      expect(tasksDueToday[0].title).toBe("Today Task");
    });
  });
});