import {
  CheckCircle as CompletedIcon,
  PlayArrow as InProgressIcon,
  Warning as OverdueIcon,
  Schedule as PendingIcon,
  Schedule,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTasks } from "../../hooks/useTasks";

export const Dashboard: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { tasks, getTasksByStatus, getOverdueTasks, getTasksDueToday } =
    useTasks();

  const taskStats = useMemo(() => {
    const totalTasks = tasks.length;
    const pendingTasks = getTasksByStatus("pending").length;
    const inProgressTasks = getTasksByStatus("in_progress").length;
    const completedTasks = getTasksByStatus("completed").length;
    const overdueTasks = getOverdueTasks().length;
    const tasksDueToday = getTasksDueToday().length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      tasksDueToday,
      completionRate,
    };
  }, [tasks, getTasksByStatus, getOverdueTasks, getTasksDueToday]);

  const stats = useMemo(
    () => [
      {
        title: t("task.status"),
        value: taskStats.totalTasks,
        icon: <TaskIcon sx={{ fontSize: 40 }} />,
        color: "primary",
        subtitle: t("common.total"),
      },
      {
        title: t("status.pending"),
        value: taskStats.pendingTasks,
        icon: <PendingIcon sx={{ fontSize: 40 }} />,
        color: "grey",
        subtitle: t("task.noTasks"),
      },
      {
        title: t("status.in_progress"),
        value: taskStats.inProgressTasks,
        icon: <InProgressIcon sx={{ fontSize: 40 }} />,
        color: "info",
        subtitle: t("common.active"),
      },
      {
        title: t("status.completed"),
        value: taskStats.completedTasks,
        icon: <CompletedIcon sx={{ fontSize: 40 }} />,
        color: "success",
        subtitle: t("common.finished"),
      },
    ],
    [t, taskStats],
  );

  const alerts = useMemo(
    () => [
      ...(taskStats.overdueTasks > 0
        ? [
            {
              type: "overdue",
              count: taskStats.overdueTasks,
              message: t("dashboard.overdueTasks", {
                count: taskStats.overdueTasks,
              }),
              color: "error" as const,
              icon: <OverdueIcon />,
            },
          ]
        : []),
      ...(taskStats.tasksDueToday > 0
        ? [
            {
              type: "due_today",
              count: taskStats.tasksDueToday,
              message: t("dashboard.tasksDueToday", {
                count: taskStats.tasksDueToday,
              }),
              color: "warning" as const,
              icon: <Schedule />,
            },
          ]
        : []),
    ],
    [t, taskStats.overdueTasks, taskStats.tasksDueToday],
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("navigation.dashboard")}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stat.value}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box color={`${stat.color}.main`}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {taskStats.totalTasks > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mb: 4,
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t("dashboard.progress")}
                </Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mr: 2 }}
                  >
                    {Math.round(taskStats.completionRate)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={taskStats.completionRate}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {t("dashboard.progressDescription", {
                    completed: taskStats.completedTasks,
                    total: taskStats.totalTasks,
                  })}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>

          {alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("dashboard.alerts")}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {alerts.map((alert) => (
                      <Box
                        key={alert.type}
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        {alert.icon}
                        <Chip
                          label={alert.message}
                          color={alert.color}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Box>
      )}

      {taskStats.totalTasks === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <TaskIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {t("dashboard.welcome")}
              </Typography>
              <Typography color="textSecondary">
                {t("dashboard.welcomeDescription")}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
});
