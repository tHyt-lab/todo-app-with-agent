import { createFileRoute } from "@tanstack/react-router";
import { TaskDetail } from "../../components/Tasks/TaskDetail";

export const Route = createFileRoute("/tasks/$taskId")({
  component: TaskDetail,
});
