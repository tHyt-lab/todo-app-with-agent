import { describe, expect, it } from "vitest";
import { createAppTheme } from "@/features/settings/utils/theme";

describe("Theme Utils", () => {
  describe("createAppTheme", () => {
    it("should create light theme", () => {
      const theme = createAppTheme("light");

      expect(theme.palette.mode).toBe("light");
      expect(theme.palette.primary.main).toBe("#1976d2");
      expect(theme.palette.secondary.main).toBe("#dc004e");
    });

    it("should create dark theme", () => {
      const theme = createAppTheme("dark");

      expect(theme.palette.mode).toBe("dark");
      expect(theme.palette.primary.main).toBe("#90caf9");
      expect(theme.palette.secondary.main).toBe("#f48fb1");
    });

    it("should have correct typography settings", () => {
      const theme = createAppTheme("light");

      expect(theme.typography.fontFamily).toContain("Roboto");
      expect(theme.typography.h1?.fontWeight).toBe(600);
      expect(theme.typography.h2?.fontWeight).toBe(600);
    });

    it("should have correct component overrides", () => {
      const theme = createAppTheme("light");

      expect(theme.components?.MuiButton?.styleOverrides?.root).toBeDefined();
      expect(theme.components?.MuiCard?.styleOverrides?.root).toBeDefined();
    });

    it("should have correct shape settings", () => {
      const theme = createAppTheme("light");

      expect(theme.shape.borderRadius).toBe(8);
    });

    it("should have correct spacing", () => {
      const theme = createAppTheme("light");

      expect(theme.spacing(1)).toBe("8px");
      expect(theme.spacing(2)).toBe("16px");
    });

    it("should maintain theme consistency across modes", () => {
      const lightTheme = createAppTheme("light");
      const darkTheme = createAppTheme("dark");

      // Shape and spacing should be consistent
      expect(lightTheme.shape.borderRadius).toBe(darkTheme.shape.borderRadius);
      expect(lightTheme.spacing(1)).toBe(darkTheme.spacing(1));

      // Typography family should be consistent
      expect(lightTheme.typography.fontFamily).toBe(
        darkTheme.typography.fontFamily,
      );
    });
  });
});
