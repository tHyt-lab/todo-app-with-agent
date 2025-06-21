import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Task, TaskFilters, TaskSort } from "@/features/tasks/types/task.types";

export const tasksAtom = atomWithStorage<Task[]>("todo-app-tasks", []);

export const taskFiltersAtom = atom<TaskFilters>({});

export const taskSortAtom = atom<TaskSort>({
  field: "createdAt",
  order: "desc",
});

export const selectedTaskIdAtom = atom<string | null>(null);

export const filteredTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const filters = get(taskFiltersAtom);
  const sort = get(taskSortAtom);

  const filtered = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !task.title.toLowerCase().includes(searchLower) &&
        !task.description?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => task.tags.includes(tag))) return false;
    }
    if (filters.dueDateRange) {
      if (
        filters.dueDateRange.start &&
        task.dueDate &&
        task.dueDate < filters.dueDateRange.start
      ) {
        return false;
      }
      if (
        filters.dueDateRange.end &&
        task.dueDate &&
        task.dueDate > filters.dueDateRange.end
      ) {
        return false;
      }
    }
    return true;
  });

  return filtered.sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    else if (aValue > bValue) comparison = 1;

    return sort.order === "asc" ? comparison : -comparison;
  });
});

export const isLoadingAtom = atom(false);
