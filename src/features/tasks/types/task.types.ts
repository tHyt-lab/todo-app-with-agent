import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(z.string()).default([]),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export type Task = z.infer<typeof TaskSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  tags?: string[];
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface TaskSort {
  field: keyof Task;
  order: "asc" | "desc";
}
