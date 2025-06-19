import { MoreVert as MoreIcon } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";
import type { Task } from "../../types";
import {
  formatDate,
  getPriorityColor,
  getStatusColor,
} from "../../utils/helpers";

interface TaskCardProps {
  task: Task;
  index: number;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, index, onMenuOpen }) => {
    const { t } = useTranslation();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        layout
      >
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            "&:hover": {
              boxShadow: 4,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={2}
            >
              <Link
                to="/tasks/$taskId"
                params={{ taskId: task.id }}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flexGrow: 1,
                  marginRight: 8,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {task.title}
                </Typography>
              </Link>
              <IconButton size="small" onClick={(e) => onMenuOpen(e, task)}>
                <MoreIcon />
              </IconButton>
            </Box>

            {task.description && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 2 }}
                noWrap
              >
                {task.description}
              </Typography>
            )}

            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip
                size="small"
                label={t(`status.${task.status}`)}
                sx={{
                  backgroundColor: getStatusColor(task.status) + "20",
                  color: getStatusColor(task.status),
                  border: `1px solid ${getStatusColor(task.status)}40`,
                }}
              />
              <Chip
                size="small"
                label={t(`priority.${task.priority}`)}
                sx={{
                  backgroundColor: getPriorityColor(task.priority) + "20",
                  color: getPriorityColor(task.priority),
                  border: `1px solid ${getPriorityColor(task.priority)}40`,
                }}
              />
            </Box>

            {task.dueDate && (
              <Typography variant="caption" color="textSecondary">
                {formatDate(task.dueDate)}
              </Typography>
            )}

            {task.tags.length > 0 && (
              <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                {task.tags.map((tag) => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);
