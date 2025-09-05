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

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

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

      await waitFor(() => {
        expect(result.current.tasks[0].tags).toEqual(["work", "urgent"]);
      });
    });

    it("should handle tags correctly when not provided", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask({ tags: undefined });

      result.current.createTask(newTask);

      await waitFor(() => {
        expect(result.current.tasks[0].tags).toEqual([]);
      });
    });

    it("should set isCreating to true during creation", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      const newTask = createNewTask();

      result.current.createTask(newTask);

      expect(result.current.isCreating).toBe(true);

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe("updateTask", () => {
    it("should update a task successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // First create a task
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const taskId = result.current.tasks[0].id;
      const updates: UpdateTask = { title: "Updated Task", status: "completed" };

      result.current.updateTask({ id: taskId, updates });

      await waitFor(() => {
        const updatedTask = result.current.tasks.find(task => task.id === taskId);
        expect(updatedTask?.title).toBe("Updated Task");
        expect(updatedTask?.status).toBe("completed");
        expect(updatedTask?.updatedAt).toBeInstanceOf(Date);
      });
    });

    it("should not modify task if id not found", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const originalTask = result.current.tasks[0];
      const updates: UpdateTask = { title: "Updated Task" };

      result.current.updateTask({ id: "non-existent-id", updates });

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0]).toEqual(originalTask);
      });
    });

    it("should set isUpdating to true during update", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const taskId = result.current.tasks[0].id;
      const updates: UpdateTask = { title: "Updated Task" };

      result.current.updateTask({ id: taskId, updates });

      expect(result.current.isUpdating).toBe(true);

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
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
      await waitFor(() => expect(result.current.tasks).toHaveLength(1));
      
      result.current.createTask(newTask2);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2));

      const taskIdToDelete = result.current.tasks[0].id;

      result.current.deleteTask(taskIdToDelete);

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks.find(task => task.id === taskIdToDelete)).toBeUndefined();
      });
    });

    it("should not modify tasks if id not found", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const originalTasks = [...result.current.tasks];

      result.current.deleteTask("non-existent-id");

      await waitFor(() => {
        expect(result.current.tasks).toEqual(originalTasks);
      });
    });

    it("should set isDeleting to true during deletion", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const taskId = result.current.tasks[0].id;

      result.current.deleteTask(taskId);

      expect(result.current.isDeleting).toBe(true);

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
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
        await waitFor(() => {
          expect(result.current.tasks.length).toBeGreaterThan(0);
        });
      }

      await waitFor(() => expect(result.current.tasks).toHaveLength(3));

      const reorderedTasks = [...result.current.tasks].reverse();

      result.current.reorderTasks(reorderedTasks);

      await waitFor(() => {
        expect(result.current.tasks).toEqual(reorderedTasks);
      });
    });

    it("should set isReordering to true during reordering", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const reorderedTasks = [...result.current.tasks];

      result.current.reorderTasks(reorderedTasks);

      expect(result.current.isReordering).toBe(true);

      await waitFor(() => {
        expect(result.current.isReordering).toBe(false);
      });
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
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const originalTaskId = result.current.tasks[0].id;

      result.current.duplicateTask(originalTaskId);

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(2);
      });

      const originalTask = result.current.tasks.find(task => task.id === originalTaskId);
      const duplicatedTask = result.current.tasks.find(task => task.id !== originalTaskId);

      expect(duplicatedTask).toBeDefined();
      expect(duplicatedTask?.title).toBe("Original Task (Copy)");
      expect(duplicatedTask?.description).toBe(originalTask?.description);
      expect(duplicatedTask?.tags).toEqual(originalTask?.tags);
      expect(duplicatedTask?.id).not.toBe(originalTask?.id);
      expect(duplicatedTask?.createdAt).toBeInstanceOf(Date);
      expect(duplicatedTask?.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error if task not found", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      result.current.duplicateTask("non-existent-id");

      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(0);
      });
    });

    it("should set isDuplicating to true during duplication", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask();
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const taskId = result.current.tasks[0].id;

      result.current.duplicateTask(taskId);

      expect(result.current.isDuplicating).toBe(true);

      await waitFor(() => {
        expect(result.current.isDuplicating).toBe(false);
      });
    });
  });

  describe("getTaskById", () => {
    it("should return task when id exists", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create a task first
      const newTask = createNewTask({ title: "Find Me" });
      result.current.createTask(newTask);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const taskId = result.current.tasks[0].id;
      const foundTask = result.current.getTaskById(taskId);

      expect(foundTask).toBeDefined();
      expect(foundTask?.title).toBe("Find Me");
      expect(foundTask?.id).toBe(taskId);
    });

    it("should return undefined when id does not exist", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const foundTask = result.current.getTaskById("non-existent-id");

      expect(foundTask).toBeUndefined();
    });
  });

  describe("getTasksByStatus", () => {
    it("should return tasks filtered by status", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create tasks with different statuses
      const pendingTask = createNewTask({ title: "Pending", status: "pending" });
      const completedTask = createNewTask({ title: "Completed", status: "completed" });
      const inProgressTask = createNewTask({ title: "In Progress", status: "in_progress" });

      result.current.createTask(pendingTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(1));
      
      result.current.createTask(completedTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2));
      
      result.current.createTask(inProgressTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(3));

      const pendingTasks = result.current.getTasksByStatus("pending");
      const completedTasks = result.current.getTasksByStatus("completed");
      const inProgressTasks = result.current.getTasksByStatus("in_progress");

      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].title).toBe("Pending");
      
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].title).toBe("Completed");
      
      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].title).toBe("In Progress");
    });

    it("should return empty array when no tasks match status", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const tasks = result.current.getTasksByStatus("completed");

      expect(tasks).toEqual([]);
    });
  });

  describe("getTasksByPriority", () => {
    it("should return tasks filtered by priority", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create tasks with different priorities
      const lowTask = createNewTask({ title: "Low", priority: "low" });
      const mediumTask = createNewTask({ title: "Medium", priority: "medium" });
      const highTask = createNewTask({ title: "High", priority: "high" });

      result.current.createTask(lowTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(1));
      
      result.current.createTask(mediumTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2));
      
      result.current.createTask(highTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(3));

      const lowTasks = result.current.getTasksByPriority("low");
      const mediumTasks = result.current.getTasksByPriority("medium");
      const highTasks = result.current.getTasksByPriority("high");

      expect(lowTasks).toHaveLength(1);
      expect(lowTasks[0].title).toBe("Low");
      
      expect(mediumTasks).toHaveLength(1);
      expect(mediumTasks[0].title).toBe("Medium");
      
      expect(highTasks).toHaveLength(1);
      expect(highTasks[0].title).toBe("High");
    });

    it("should return empty array when no tasks match priority", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const tasks = result.current.getTasksByPriority("high");

      expect(tasks).toEqual([]);
    });
  });

  describe("getOverdueTasks", () => {
    it("should return tasks that are overdue and not completed", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Set current time
      vi.setSystemTime(new Date("2023-01-10T12:00:00Z"));
      
      // Create tasks with different due dates
      const overdueTask = createNewTask({ 
        title: "Overdue", 
        dueDate: new Date("2023-01-05"),
        status: "pending"
      });
      const futureTask = createNewTask({ 
        title: "Future", 
        dueDate: new Date("2023-01-15"),
        status: "pending"
      });
      const overdueCompletedTask = createNewTask({ 
        title: "Overdue Completed", 
        dueDate: new Date("2023-01-05"),
        status: "completed"
      });

      result.current.createTask(overdueTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(1));
      
      result.current.createTask(futureTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2));
      
      result.current.createTask(overdueCompletedTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(3));

      const overdueTasks = result.current.getOverdueTasks();

      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe("Overdue");
    });

    it("should return empty array when no tasks are overdue", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const overdueTasks = result.current.getOverdueTasks();

      expect(overdueTasks).toEqual([]);
    });

    it("should handle tasks without due dates", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create task without due date
      const taskWithoutDue = createNewTask({ title: "No Due Date" });
      result.current.createTask(taskWithoutDue);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const overdueTasks = result.current.getOverdueTasks();

      expect(overdueTasks).toEqual([]);
    });
  });

  describe("getTasksDueToday", () => {
    it("should return tasks due today", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      // Set current time to January 1, 2023
      vi.setSystemTime(new Date("2023-01-01T12:00:00Z"));
      
      // Create tasks with different due dates
      const todayTask = createNewTask({ 
        title: "Due Today", 
        dueDate: new Date("2023-01-01T18:00:00Z")
      });
      const yesterdayTask = createNewTask({ 
        title: "Due Yesterday", 
        dueDate: new Date("2022-12-31T18:00:00Z")
      });
      const tomorrowTask = createNewTask({ 
        title: "Due Tomorrow", 
        dueDate: new Date("2023-01-02T06:00:00Z")
      });

      result.current.createTask(todayTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(1));
      
      result.current.createTask(yesterdayTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(2));
      
      result.current.createTask(tomorrowTask);
      await waitFor(() => expect(result.current.tasks).toHaveLength(3));

      const todayTasks = result.current.getTasksDueToday();

      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].title).toBe("Due Today");
    });

    it("should return empty array when no tasks are due today", () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });

      const todayTasks = result.current.getTasksDueToday();

      expect(todayTasks).toEqual([]);
    });

    it("should handle tasks without due dates", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useTasks(), { wrapper });
      
      // Create task without due date
      const taskWithoutDue = createNewTask({ title: "No Due Date" });
      result.current.createTask(taskWithoutDue);
      
      await waitFor(() => {
        expect(result.current.tasks).toHaveLength(1);
      });

      const todayTasks = result.current.getTasksDueToday();

      expect(todayTasks).toEqual([]);
    });
  });
});