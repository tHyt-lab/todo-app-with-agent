import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadFromStorage,
  removeFromStorage,
  STORAGE_KEYS,
  saveToStorage,
} from "@/shared/utils/storage";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Storage Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("STORAGE_KEYS", () => {
    it("should have correct key values", () => {
      expect(STORAGE_KEYS.TASKS).toBe("todo-app-tasks");
      expect(STORAGE_KEYS.SETTINGS).toBe("todo-app-settings");
      expect(STORAGE_KEYS.LANGUAGE).toBe("todo-app-language");
    });
  });

  describe("saveToStorage", () => {
    it("should save data to localStorage as JSON", () => {
      const testData = { name: "test", value: 123 };
      const key = "test-key";

      saveToStorage(key, testData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData),
      );
    });

    it("should handle storage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      expect(() => saveToStorage("test", {})).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("loadFromStorage", () => {
    it("should retrieve and parse data from localStorage", () => {
      const testData = { name: "test", value: 123 };
      const defaultValue = { name: "default", value: 0 };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = loadFromStorage("test-key", defaultValue);

      expect(localStorageMock.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toEqual(testData);
    });

    it("should return default value for non-existent keys", () => {
      const defaultValue = { name: "default", value: 0 };
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadFromStorage("non-existent", defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it("should return default value for invalid JSON", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });
      const defaultValue = { name: "default", value: 0 };
      localStorageMock.getItem.mockReturnValue("invalid json");

      const result = loadFromStorage("test-key", defaultValue);

      expect(result).toEqual(defaultValue);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle storage errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });
      const defaultValue = { name: "default", value: 0 };
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

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

    it("should handle removal errors gracefully", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {
        // Mock implementation - intentionally empty
      });
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      expect(() => removeFromStorage("test-key")).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
