import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ja } from "date-fns/locale";
import { Provider, useAtom } from "jotai";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "../components/Layout/AppLayout";
import { languageAtom, themeAtom } from "../store/atoms";
import { createAppTheme } from "../utils/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function RootComponent() {
  const [theme] = useAtom(themeAtom);
  const [language] = useAtom(languageAtom);
  const { i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const muiTheme = createAppTheme(theme);

  return (
    <Provider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={language === "ja" ? ja : undefined}
          >
            <CssBaseline />
            <AppLayout>
              <Outlet />
            </AppLayout>
          </LocalizationProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <TanStackRouterDevtools />
    </Provider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
