import React, { useCallback, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  CreateTaskSchema,
  Task,
  CreateTask,
  TaskStatus,
  TaskPriority,
} from "../../types";
import { useTasks } from "../../hooks/useTasks";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = React.memo(
  ({ task, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { createTask, updateTask } = useTasks();
    const isEditing = Boolean(task);

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<CreateTask>({
      resolver: zodResolver(CreateTaskSchema),
      defaultValues: {
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || "pending",
        priority: task?.priority || "medium",
        dueDate: task?.dueDate,
        tags: task?.tags || [],
      },
    });

    const onSubmit = useCallback(
      async (data: CreateTask) => {
        try {
          if (isEditing && task) {
            updateTask({ id: task.id, updates: data });
          } else {
            createTask(data);
          }
          onSuccess();
        } catch (error) {
          console.error("Failed to save task:", error);
        }
      },
      [isEditing, task, updateTask, createTask, onSuccess],
    );

    const statusOptions = useMemo(
      () => [
        { value: "pending" as TaskStatus, label: t("status.pending") },
        { value: "in_progress" as TaskStatus, label: t("status.in_progress") },
        { value: "completed" as TaskStatus, label: t("status.completed") },
      ],
      [t],
    );

    const priorityOptions = useMemo(
      () => [
        { value: "low" as TaskPriority, label: t("priority.low") },
        { value: "medium" as TaskPriority, label: t("priority.medium") },
        { value: "high" as TaskPriority, label: t("priority.high") },
      ],
      [t],
    );

    return (
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {isEditing ? t("task.editTask") : t("task.createTask")}
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("task.title")}
                  fullWidth
                  required
                  error={Boolean(errors.title)}
                  helperText={errors.title?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("task.description")}
                  fullWidth
                  multiline
                  rows={3}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t("task.status")}</InputLabel>
                  <Select {...field} label={t("task.status")}>
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>{t("task.priority")}</InputLabel>
                  <Select {...field} label={t("task.priority")}>
                    {priorityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label={t("task.dueDate")}
                  value={field.value || null}
                  onChange={(newValue) => field.onChange(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.dueDate),
                      helperText: errors.dueDate?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={field.value}
                  onChange={(_, newValue) => {
                    field.onChange(
                      newValue.map((tag) =>
                        typeof tag === "string" ? tag : tag,
                      ),
                    );
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option}
                          {...tagProps}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("task.tags")}
                      placeholder={t("task.addTag")}
                    />
                  )}
                />
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {t("form.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t("form.save")}
          </Button>
        </DialogActions>
      </Box>
    );
  },
);
