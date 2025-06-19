import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ja } from "date-fns/locale";
import { Provider, useAtom } from "jotai";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { AppLayout } from "./components/Layout/AppLayout";
import { TaskDetail } from "./components/Tasks/TaskDetail";
import { TaskList } from "./components/Tasks/TaskList";
import { languageAtom, themeAtom } from "./store/atoms";
import { createAppTheme } from "./utils/theme";
import "./index.css";
import "./locales";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const [theme] = useAtom(themeAtom);
  const [language] = useAtom(languageAtom);
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const muiTheme = createAppTheme(theme);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <LocalizationProvider
          dateAdapter={AdapterDateFns}
          adapterLocale={language === "ja" ? ja : undefined}
        >
          <CssBaseline />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
