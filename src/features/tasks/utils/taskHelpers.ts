import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ja } from "date-fns/locale";
import { TaskPriority, TaskStatus } from "../types/task.types";

export const formatDate = (date: Date, locale: string = "ja"): string => {
  const dateLocale = locale === "ja" ? ja : undefined;

  if (isToday(date)) {
    return locale === "ja" ? "今日" : "Today";
  }

  if (isTomorrow(date)) {
    return locale === "ja" ? "明日" : "Tomorrow";
  }

  return format(date, locale === "ja" ? "M月d日(E)" : "MMM d, E", {
    locale: dateLocale,
  });
};

export const formatDateTime = (date: Date, locale: string = "ja"): string => {
  const dateLocale = locale === "ja" ? ja : undefined;
  return format(date, locale === "ja" ? "M月d日 HH:mm" : "MMM d, HH:mm", {
    locale: dateLocale,
  });
};

export const isOverdue = (date: Date): boolean => {
  return isPast(date) && !isToday(date);
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case "high":
      return "#f44336";
    case "medium":
      return "#ff9800";
    case "low":
      return "#4caf50";
    default:
      return "#9e9e9e";
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case "completed":
      return "#4caf50";
    case "in_progress":
      return "#2196f3";
    case "pending":
      return "#9e9e9e";
    default:
      return "#9e9e9e";
  }
};

export const formatTaskCount = (
  count: number,
  locale: string = "ja",
): string => {
  if (locale === "ja") {
    return `${count}件のタスク`;
  }
  return count === 1 ? "1 task" : `${count} tasks`;
};
