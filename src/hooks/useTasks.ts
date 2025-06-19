import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { isLoadingAtom, tasksAtom } from "../store/atoms";
import type { CreateTask, Task, UpdateTask } from "../types";
import { generateId } from "../utils/helpers";

const TASKS_QUERY_KEY = ["tasks"];

export const useTasks = () => {
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => {
      return Promise.resolve(tasks);
    },
    initialData: tasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: CreateTask) => {
      setIsLoading(true);
      const task: Task = {
        ...newTask,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: newTask.tags ?? [],
      };
      const updatedTasks = [...tasks, task];
      setTasks(updatedTasks);
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateTask;
    }) => {
      setIsLoading(true);
      const updatedTasks = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: new Date(),
            }
          : task,
      );
      setTasks(updatedTasks);
      return updatedTasks.find((task) => task.id === id) ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const reorderTasksMutation = useMutation({
    mutationFn: async (reorderedTasks: Task[]) => {
      setIsLoading(true);
      setTasks(reorderedTasks);
      return reorderedTasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const duplicateTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      const originalTask = tasks.find((task) => task.id === id);
      if (!originalTask) throw new Error("Task not found");

      const duplicatedTask: Task = {
        ...originalTask,
        id: generateId(),
        title: `${originalTask.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedTasks = [...tasks, duplicatedTask];
      setTasks(updatedTasks);
      return duplicatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const getTaskById = (id: string) => tasks.find((task) => task.id === id);

  const getTasksByStatus = (status: Task["status"]) =>
    tasks.filter((task) => task.status === status);

  const getTasksByPriority = (priority: Task["priority"]) =>
    tasks.filter((task) => task.priority === priority);

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(
      (task) =>
        task.dueDate && task.dueDate < now && task.status !== "completed",
    );
  };

  const getTasksDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(
      (task) =>
        task.dueDate && task.dueDate >= today && task.dueDate < tomorrow,
    );
  };

  return {
    tasks: tasksQuery.data || [],
    isLoading: isLoading || tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    reorderTasks: reorderTasksMutation.mutate,
    duplicateTask: duplicateTaskMutation.mutate,
    getTaskById,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    getTasksDueToday,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isReordering: reorderTasksMutation.isPending,
    isDuplicating: duplicateTaskMutation.isPending,
  };
};
