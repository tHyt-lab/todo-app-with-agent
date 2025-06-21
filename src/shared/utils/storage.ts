import { Task } from "@/features/tasks/types/task.types";

export const STORAGE_KEYS = {
  TASKS: "todo-app-tasks",
  SETTINGS: "todo-app-settings",
  LANGUAGE: "todo-app-language",
} as const;

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
};

export const serializeTask = (task: Task): Task => ({
  ...task,
  createdAt: new Date(task.createdAt),
  updatedAt: new Date(task.updatedAt),
  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
});

export const deserializeTasks = (tasks: Task[]): Task[] => {
  return tasks.map(serializeTask);
};
