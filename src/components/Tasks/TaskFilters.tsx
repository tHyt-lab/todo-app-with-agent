import { Clear as ClearIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useAtom } from "jotai";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { taskFiltersAtom, taskSortAtom } from "../../store/atoms";
import { TaskPriority, TaskSort, TaskStatus } from "../../types";
import { debounce } from "../../utils/helpers";

export const TaskFilters: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [filters, setFilters] = useAtom(taskFiltersAtom);
  const [sort, setSort] = useAtom(taskSortAtom);

  const [searchValue, setSearchValue] = React.useState(filters.search || "");

  const debouncedSetSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, search: value || undefined }));
      }, 300),
    [setFilters],
  );

  React.useEffect(() => {
    debouncedSetSearch(searchValue);
  }, [searchValue, debouncedSetSearch]);

  const handleStatusChange = useCallback(
    (status: TaskStatus | "") => {
      setFilters((prev) => ({
        ...prev,
        status: status || undefined,
      }));
    },
    [setFilters],
  );

  const handlePriorityChange = useCallback(
    (priority: TaskPriority | "") => {
      setFilters((prev) => ({
        ...prev,
        priority: priority || undefined,
      }));
    },
    [setFilters],
  );

  const handleSortChange = useCallback(
    (field: TaskSort["field"], order: TaskSort["order"]) => {
      setSort({ field, order });
    },
    [setSort],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchValue("");
    setSort({ field: "createdAt", order: "desc" });
  }, [setFilters, setSort]);

  const hasActiveFilters = useMemo(
    () => Boolean(filters.status || filters.priority || filters.search),
    [filters.status, filters.priority, filters.search],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "pending", label: t("status.pending") },
      { value: "in_progress", label: t("status.in_progress") },
      { value: "completed", label: t("status.completed") },
    ],
    [t],
  );

  const priorityOptions = useMemo(
    () => [
      { value: "", label: t("common.all") },
      { value: "low", label: t("priority.low") },
      { value: "medium", label: t("priority.medium") },
      { value: "high", label: t("priority.high") },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { field: "createdAt", order: "desc", label: t("sort.newest") },
      { field: "createdAt", order: "asc", label: t("sort.oldest") },
      { field: "title", order: "asc", label: t("sort.titleAsc") },
      { field: "title", order: "desc", label: t("sort.titleDesc") },
      { field: "priority", order: "desc", label: t("sort.priorityHigh") },
      { field: "priority", order: "asc", label: t("sort.priorityLow") },
      { field: "dueDate", order: "asc", label: t("sort.dueDateSoon") },
    ],
    [t],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 3,
      }}
    >
      <TextField
        placeholder={t("search.placeholder")}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchValue("")}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1 }}
      />

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>{t("task.status")}</InputLabel>
        <Select
          value={filters.status || ""}
          onChange={(e) =>
            handleStatusChange(e.target.value as TaskStatus | "")
          }
          label={t("task.status")}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>{t("task.priority")}</InputLabel>
        <Select
          value={filters.priority || ""}
          onChange={(e) =>
            handlePriorityChange(e.target.value as TaskPriority | "")
          }
          label={t("task.priority")}
        >
          {priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>{t("search.sort")}</InputLabel>
        <Select
          value={`${sort.field}-${sort.order}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            handleSortChange(
              field as TaskSort["field"],
              order as TaskSort["order"],
            );
          }}
          label={t("search.sort")}
        >
          {sortOptions.map((option) => (
            <MenuItem
              key={`${option.field}-${option.order}`}
              value={`${option.field}-${option.order}`}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button
          startIcon={<ClearIcon />}
          onClick={clearFilters}
          variant="outlined"
          sx={{ whiteSpace: "nowrap" }}
        >
          {t("search.clear")}
        </Button>
      )}
    </Box>
  );
});
