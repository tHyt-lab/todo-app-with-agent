import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTasks } from "../../hooks/useTasks";
import {
  formatDateTime,
  getPriorityColor,
  getStatusColor,
} from "../../utils/helpers";
import { TaskForm } from "./TaskForm";

export const TaskDetail: React.FC = React.memo(() => {
  const { taskId } = useParams({ from: "/tasks/$taskId" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTaskById, deleteTask, duplicateTask } = useTasks();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const task = taskId ? getTaskById(taskId) : null;

  const handleDelete = useCallback(() => {
    if (task && window.confirm(t("task.confirmDelete"))) {
      deleteTask(task.id);
      navigate({ to: "/tasks" });
    }
  }, [task, t, deleteTask, navigate]);

  const handleDuplicate = useCallback(() => {
    if (task) {
      duplicateTask(task.id);
      navigate({ to: "/tasks" });
    }
  }, [task, duplicateTask, navigate]);

  const handleGoBack = useCallback(() => {
    navigate({ to: "/tasks" });
  }, [navigate]);

  const handleEdit = useCallback(() => {
    setShowEditDialog(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  if (!task) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="h6" gutterBottom>
          {t("task.notFound")}
        </Typography>
        <Button onClick={handleGoBack}>{t("common.goBack")}</Button>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={handleGoBack}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {task.title}
          </Typography>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={handleEdit}
          >
            {t("task.editTask")}
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Box display="flex" gap={1} mb={3}>
              <Chip
                label={t(`status.${task.status}`)}
                sx={{
                  backgroundColor: getStatusColor(task.status) + "20",
                  color: getStatusColor(task.status),
                  border: `1px solid ${getStatusColor(task.status)}40`,
                }}
              />
              <Chip
                label={t(`priority.${task.priority}`)}
                sx={{
                  backgroundColor: getPriorityColor(task.priority) + "20",
                  color: getPriorityColor(task.priority),
                  border: `1px solid ${getPriorityColor(task.priority)}40`,
                }}
              />
            </Box>

            {task.description && (
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  {t("task.description")}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {task.description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={2}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  {t("task.createdAt")}
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(task.createdAt)}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  {t("task.updatedAt")}
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(task.updatedAt)}
                </Typography>
              </Box>

              {task.dueDate && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {t("task.dueDate")}
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(task.dueDate)}
                  </Typography>
                </Box>
              )}

              {task.tags.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {t("task.tags")}
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {task.tags.map((tag) => (
                      <Chip
                        key={tag}
                        size="small"
                        label={tag}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button startIcon={<DuplicateIcon />} onClick={handleDuplicate}>
                {t("task.duplicateTask")}
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                onClick={handleDelete}
              >
                {t("task.deleteTask")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Dialog
          open={showEditDialog}
          onClose={handleEditDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <TaskForm
            task={task}
            onClose={handleEditDialogClose}
            onSuccess={handleEditDialogClose}
          />
        </Dialog>
      </Box>
    </motion.div>
  );
});
