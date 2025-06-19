import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  debounce,
  formatDate,
  formatDateTime,
  formatTaskCount,
  generateId,
  getPriorityColor,
  getStatusColor,
  isOverdue,
  truncateText,
  validateEmail,
} from "../helpers";

describe("helpers", () => {
  describe("generateId", () => {
    it("should generate a unique string ID", () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe("formatDate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
    });

    it('should format today as "今日" in Japanese', () => {
      const today = new Date("2024-01-15T12:00:00Z");
      expect(formatDate(today, "ja")).toBe("今日");
    });

    it('should format today as "Today" in English', () => {
      const today = new Date("2024-01-15T12:00:00Z");
      expect(formatDate(today, "en")).toBe("Today");
    });

    it('should format tomorrow as "明日" in Japanese', () => {
      const tomorrow = new Date("2024-01-16T12:00:00Z");
      expect(formatDate(tomorrow, "ja")).toBe("明日");
    });

    it('should format tomorrow as "Tomorrow" in English', () => {
      const tomorrow = new Date("2024-01-16T12:00:00Z");
      expect(formatDate(tomorrow, "en")).toBe("Tomorrow");
    });

    it("should format other dates correctly", () => {
      const otherDate = new Date("2024-01-20T12:00:00Z");
      const formatted = formatDate(otherDate, "ja");
      expect(formatted).toMatch(/1月20日/);
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time correctly", () => {
      const date = new Date("2024-01-15T14:30:00Z");
      const formatted = formatDateTime(date, "ja");
      // タイムゾーンの違いを考慮してより緩い検証
      expect(formatted).toMatch(/1月15日/);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("isOverdue", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));
    });

    it("should return true for past dates", () => {
      const pastDate = new Date("2024-01-14T10:00:00Z");
      expect(isOverdue(pastDate)).toBe(true);
    });

    it("should return false for today", () => {
      const today = new Date("2024-01-15T12:00:00Z");
      expect(isOverdue(today)).toBe(false);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date("2024-01-16T10:00:00Z");
      expect(isOverdue(futureDate)).toBe(false);
    });
  });

  describe("getPriorityColor", () => {
    it("should return correct colors for priorities", () => {
      expect(getPriorityColor("high")).toBe("#f44336");
      expect(getPriorityColor("medium")).toBe("#ff9800");
      expect(getPriorityColor("low")).toBe("#4caf50");
      expect(getPriorityColor("unknown")).toBe("#9e9e9e");
    });
  });

  describe("getStatusColor", () => {
    it("should return correct colors for statuses", () => {
      expect(getStatusColor("completed")).toBe("#4caf50");
      expect(getStatusColor("in_progress")).toBe("#2196f3");
      expect(getStatusColor("pending")).toBe("#9e9e9e");
      expect(getStatusColor("unknown")).toBe("#9e9e9e");
    });
  });

  describe("truncateText", () => {
    it("should not truncate short text", () => {
      const text = "Short text";
      expect(truncateText(text, 100)).toBe(text);
    });

    it("should truncate long text with default length", () => {
      const longText = "a".repeat(150);
      const truncated = truncateText(longText);
      expect(truncated).toBe("a".repeat(100) + "...");
    });

    it("should truncate with custom length", () => {
      const text = "This is a long text";
      const truncated = truncateText(text, 10);
      expect(truncated).toBe("This is a ...");
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("should delay function execution", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should cancel previous calls", () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledOnce();
    });
  });

  describe("formatTaskCount", () => {
    it("should format count in Japanese", () => {
      expect(formatTaskCount(0, "ja")).toBe("0件のタスク");
      expect(formatTaskCount(5, "ja")).toBe("5件のタスク");
    });

    it("should format count in English", () => {
      expect(formatTaskCount(0, "en")).toBe("0 tasks");
      expect(formatTaskCount(1, "en")).toBe("1 task");
      expect(formatTaskCount(5, "en")).toBe("5 tasks");
    });
  });

  describe("validateEmail", () => {
    it("should validate correct emails", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.jp")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });
});
