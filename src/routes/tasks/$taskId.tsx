import { createFileRoute } from "@tanstack/react-router";
import { TaskDetail } from "@/features/tasks/components/TaskDetail";

export const Route = createFileRoute("/tasks/$taskId")({
  component: TaskDetail,
});
