import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Fab,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { filteredTasksAtom } from "@/features/tasks/store/atoms";
import type { Task } from "@/features/tasks/types/task.types";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import { TaskForm } from "./TaskForm";

export const TaskList: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [filteredTasks] = useAtom(filteredTasksAtom);
  const { deleteTask, duplicateTask } = useTasks();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, task: Task) => {
      setAnchorEl(event.currentTarget);
      setSelectedTask(task);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedTask(null);
  }, []);

  const handleEdit = useCallback(() => {
    setShowEditDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDuplicate = useCallback(() => {
    if (selectedTask) {
      duplicateTask(selectedTask.id);
    }
    handleMenuClose();
  }, [selectedTask, duplicateTask, handleMenuClose]);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const confirmDelete = useCallback(() => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
    }
    setShowDeleteDialog(false);
    setSelectedTask(null);
  }, [selectedTask, deleteTask]);

  const handleCreateDialogClose = useCallback(() => {
    setShowCreateDialog(false);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setShowEditDialog(false);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {t("navigation.tasks")}
        </Typography>
      </Box>

      <TaskFilters />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mt: 2,
        }}
      >
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onMenuOpen={handleMenuOpen}
            />
          ))}
        </AnimatePresence>
      </Box>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ mt: 4 }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" gutterBottom>
                {t("task.noTasks")}
              </Typography>
              <Typography color="textSecondary">
                {t("task.createFirstTask")}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Fab
        color="primary"
        aria-label="add task"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowCreateDialog(true)}
      >
        <AddIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          {t("task.editTask")}
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <DuplicateIcon sx={{ mr: 1 }} />
          {t("task.duplicateTask")}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          {t("task.deleteTask")}
        </MenuItem>
      </Menu>

      <Dialog
        open={showCreateDialog}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <TaskForm
          onClose={handleCreateDialogClose}
          onSuccess={handleCreateDialogClose}
        />
      </Dialog>

      <Dialog
        open={showEditDialog}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            onClose={handleEditDialogClose}
            onSuccess={handleEditDialogClose}
          />
        )}
      </Dialog>

      <Dialog open={showDeleteDialog} onClose={handleDeleteDialogClose}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t("task.confirmDelete")}
          </Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            {selectedTask?.title}
          </Typography>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button onClick={handleDeleteDialogClose}>
              {t("form.cancel")}
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              {t("task.deleteTask")}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
});
