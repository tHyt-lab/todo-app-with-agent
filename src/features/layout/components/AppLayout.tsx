import {
  DarkMode,
  Dashboard as DashboardIcon,
  Language as LanguageIcon,
  LightMode,
  Menu as MenuIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { languageAtom, themeAtom } from "@/features/settings/store/atoms";
import i18n from "@/locales";

interface AppLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;

export const AppLayout: React.FC<AppLayoutProps> = React.memo(
  ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [currentTheme, setTheme] = useAtom(themeAtom);
    const [currentLanguage, setLanguage] = useAtom(languageAtom);
    const { t } = useTranslation();
    const theme = useTheme();
    const location = useLocation();

    const handleDrawerToggle = useCallback(() => {
      setMobileOpen(!mobileOpen);
    }, [mobileOpen]);

    const handleDrawerClose = useCallback(() => {
      setMobileOpen(false);
    }, []);

    const handleThemeToggle = useCallback(() => {
      setTheme(currentTheme === "light" ? "dark" : "light");
    }, [currentTheme, setTheme]);

    const handleLanguageToggle = useCallback(() => {
      const newLanguage = currentLanguage === "ja" ? "en" : "ja";
      setLanguage(newLanguage);
      // i18nextの言語も更新
      i18n.changeLanguage(newLanguage);
    }, [currentLanguage, setLanguage]);

    const menuItems = useMemo(
      () => [
        {
          text: t("navigation.dashboard"),
          icon: <DashboardIcon />,
          path: "/dashboard",
        },
        {
          text: t("navigation.tasks"),
          icon: <TaskIcon />,
          path: "/tasks",
        },
      ],
      [t],
    );

    const drawer = useMemo(
      () => (
        <Box>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              {t("app.title")}
            </Typography>
          </Toolbar>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={handleDrawerClose}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.primary.main + "20",
                      borderRight: `3px solid ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ),
      [
        t,
        menuItems,
        location.pathname,
        theme.palette.primary.main,
        handleDrawerClose,
      ],
    );

    return (
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {t("app.title")}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mr: 2,
                opacity: 0.8,
                fontSize: "0.75rem",
                display: { xs: "none", sm: "block" },
              }}
            >
              v{__APP_VERSION__}
            </Typography>

            <IconButton
              color="inherit"
              onClick={handleLanguageToggle}
              aria-label={t("language.switch")}
            >
              <LanguageIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleThemeToggle}
              aria-label={t("theme.toggle")}
            >
              {currentTheme === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
          aria-label="navigation"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: "64px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Box>
      </Box>
    );
  },
);
