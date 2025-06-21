import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  debounce,
  generateId,
  truncateText,
  validateEmail,
} from "@/shared/utils/helpers";

describe("generateId", () => {
  it("should generate a unique string ID", () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(typeof id1).toBe("string");
    expect(typeof id2).toBe("string");
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it("should generate IDs with consistent format", () => {
    const id = generateId();
    // Should contain a dash separating timestamp and random parts
    expect(id).toMatch(/-/);
  });
});

describe("truncateText", () => {
  it("should not truncate text shorter than max length", () => {
    const text = "Short text";
    const result = truncateText(text, 20);
    expect(result).toBe(text);
  });

  it("should truncate text longer than max length", () => {
    const text = "This is a very long text that should be truncated";
    const result = truncateText(text, 20);
    expect(result).toBe("This is a very long ...");
    expect(result.length).toBe(23); // 20 + "..."
  });

  it("should use default max length of 100", () => {
    const text = "a".repeat(120);
    const result = truncateText(text);
    expect(result).toBe("a".repeat(100) + "...");
  });

  it("should handle empty string", () => {
    const result = truncateText("", 10);
    expect(result).toBe("");
  });

  it("should handle exact max length", () => {
    const text = "a".repeat(10);
    const result = truncateText(text, 10);
    expect(result).toBe(text);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should delay function execution", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it("should cancel previous calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it("should pass arguments correctly", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("arg1", "arg2");
    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
  });

  it("should handle multiple rapid calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    for (let i = 0; i < 10; i++) {
      debouncedFn(i);
      vi.advanceTimersByTime(50);
    }

    // Only the last call should execute after the full delay
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith(9);
  });
});

describe("validateEmail", () => {
  it("should validate correct email addresses", () => {
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "user+tag@example.org",
      "123@numbers.com",
    ];

    validEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(true);
    });
  });

  it("should reject invalid email addresses", () => {
    const invalidEmails = [
      "invalid-email",
      "@example.com",
      "user@",
      "user@.com",
      "user.example.com",
      "",
      "user space@example.com",
    ];

    invalidEmails.forEach((email) => {
      expect(validateEmail(email)).toBe(false);
    });
  });
});
