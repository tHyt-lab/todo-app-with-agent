import { createFileRoute } from "@tanstack/react-router";
import { TaskList } from "../../components/Tasks/TaskList";

export const Route = createFileRoute("/tasks/")({
  component: TaskList,
});
