import { describe, it, expect } from "vitest";
import { createAppTheme } from "../theme";

describe("theme", () => {
  describe("createAppTheme", () => {
    it("should create light theme", () => {
      const theme = createAppTheme("light");

      expect(theme.palette.mode).toBe("light");
      expect(theme.palette.primary.main).toBe("#1976d2");
      expect(theme.palette.background.default).toBe("#fafafa");
      expect(theme.palette.text.primary).toBe("#000000");
    });

    it("should create dark theme", () => {
      const theme = createAppTheme("dark");

      expect(theme.palette.mode).toBe("dark");
      expect(theme.palette.primary.main).toBe("#90caf9");
      expect(theme.palette.background.default).toBe("#121212");
      expect(theme.palette.text.primary).toBe("#ffffff");
    });

    it("should have correct typography settings", () => {
      const theme = createAppTheme("light");

      expect(theme.typography.fontFamily).toContain("-apple-system");
      expect(theme.typography.h1.fontWeight).toBe(600);
    });

    it("should have correct shape settings", () => {
      const theme = createAppTheme("light");

      expect(theme.shape.borderRadius).toBe(8);
    });

    it("should have custom component overrides", () => {
      const lightTheme = createAppTheme("light");
      const darkTheme = createAppTheme("dark");

      expect(lightTheme.components?.MuiCard?.styleOverrides?.root).toEqual({
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      });

      expect(darkTheme.components?.MuiCard?.styleOverrides?.root).toEqual({
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      });
    });

    it("should have button overrides", () => {
      const theme = createAppTheme("light");

      expect(theme.components?.MuiButton?.styleOverrides?.root).toEqual({
        textTransform: "none",
        fontWeight: 600,
      });
    });

    it("should have TextField default props", () => {
      const theme = createAppTheme("light");

      expect(theme.components?.MuiTextField?.defaultProps?.variant).toBe(
        "outlined",
      );
    });
  });
});
