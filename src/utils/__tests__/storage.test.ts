import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
  serializeTask,
  deserializeTasks,
  STORAGE_KEYS,
} from "../storage";
import type { Task } from "../../types";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal("localStorage", localStorageMock);

describe("storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("STORAGE_KEYS", () => {
    it("should have correct keys", () => {
      expect(STORAGE_KEYS.TASKS).toBe("todo-app-tasks");
      expect(STORAGE_KEYS.SETTINGS).toBe("todo-app-settings");
      expect(STORAGE_KEYS.LANGUAGE).toBe("todo-app-language");
    });
  });

  describe("saveToStorage", () => {
    it("should save data to localStorage", () => {
      const data = { test: "value" };
      saveToStorage("test-key", data);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(data),
      );
    });

    it("should handle errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      saveToStorage("test-key", { test: "value" });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save to localStorage:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("loadFromStorage", () => {
    it("should load data from localStorage", () => {
      const data = { test: "value" };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(data));

      const result = loadFromStorage("test-key", {});

      expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toEqual(data);
    });

    it("should return default value when item does not exist", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const defaultValue = { default: true };

      const result = loadFromStorage("test-key", defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it("should handle JSON parse errors", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue("invalid json");
      const defaultValue = { default: true };

      const result = loadFromStorage("test-key", defaultValue);

      expect(result).toEqual(defaultValue);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("removeFromStorage", () => {
    it("should remove item from localStorage", () => {
      removeFromStorage("test-key");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("test-key");
    });

    it("should handle errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Remove error");
      });

      removeFromStorage("test-key");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to remove from localStorage:",
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe("serializeTask", () => {
    it("should convert date strings to Date objects", () => {
      const task = {
        id: "1",
        title: "Test Task",
        status: "pending" as const,
        priority: "medium" as const,
        createdAt: new Date("2024-01-15T10:00:00Z"),
        updatedAt: new Date("2024-01-15T11:00:00Z"),
        dueDate: new Date("2024-01-20T10:00:00Z"),
        tags: ["test"],
      };

      const serialized = serializeTask(task);

      expect(serialized.createdAt).toBeInstanceOf(Date);
      expect(serialized.updatedAt).toBeInstanceOf(Date);
      expect(serialized.dueDate).toBeInstanceOf(Date);
    });

    it("should handle undefined dueDate", () => {
      const task = {
        id: "1",
        title: "Test Task",
        status: "pending" as const,
        priority: "medium" as const,
        createdAt: new Date("2024-01-15T10:00:00Z"),
        updatedAt: new Date("2024-01-15T11:00:00Z"),
        tags: ["test"],
      };

      const serialized = serializeTask(task);

      expect(serialized.dueDate).toBeUndefined();
    });
  });

  describe("deserializeTasks", () => {
    it("should deserialize array of tasks", () => {
      const tasks: Task[] = [
        {
          id: "1",
          title: "Task 1",
          status: "pending",
          priority: "high",
          createdAt: new Date("2024-01-15T10:00:00Z"),
          updatedAt: new Date("2024-01-15T11:00:00Z"),
          tags: [],
        },
        {
          id: "2",
          title: "Task 2",
          status: "completed",
          priority: "low",
          createdAt: new Date("2024-01-16T10:00:00Z"),
          updatedAt: new Date("2024-01-16T11:00:00Z"),
          dueDate: new Date("2024-01-20T10:00:00Z"),
          tags: ["work"],
        },
      ];

      const deserialized = deserializeTasks(tasks);

      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].createdAt).toBeInstanceOf(Date);
      expect(deserialized[1].dueDate).toBeInstanceOf(Date);
    });
  });
});
