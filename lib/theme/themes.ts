// Theme definitions for light and dark modes

// Layout constants (shared across all themes)
const layout = {
  breakpoint: "768px",
  contentMaxWidth: "80rem",
  adminMaxWidth: "80rem",
  containerPadding: "1.6rem",
};

export const lightTheme = {
  mode: "light" as const,

  // Colors - Tunaground Blue Aesthetic
  background: "#f7f9fb",
  foreground: "#000000",
  primary: "#0071bc", // Tunaground Primary Blue
  secondary: "#5d6d7e",
  accent: "#2980b9",

  // Surface colors
  surface: "#ffffff",
  surfaceHover: "#f1f8fe", // Light blue tint
  surfaceBorder: "#d1e1ef", // Soft blue border

  // Specific surface colors
  topBar: "#0071bc",
  topBarText: "#ffffff",
  topBarHover: "#005b96",
  sidebar: "#f1f8fe",
  sidebarText: "#445566",
  sidebarHover: "#e1effa",
  sidebarActive: "#c1e0f7",
  responseCard: "#ffffff",

  // Text colors - PURE BLACK
  textPrimary: "#000000",
  textSecondary: "#000000",
  textMuted: "#667788",

  // Button colors
  buttonPrimary: "#88b4d8", // Tunaground Submit Button Blue
  buttonPrimaryText: "#ffffff",

  // Status colors
  success: "#2ecc71",
  warning: "#f1c40f",
  error: "#e74c3c",
  info: "#0071bc",

  // TOM specific
  calcExpColor: "#e67e22",
  anchorALinkColor: "#0071bc",
  spoilerBackground: "#000000",

  // Toast
  toastBackground: "#2c3e50",
  toastText: "#ffffff",

  // Layout
  ...layout,
};

export const darkTheme = {
  mode: "dark" as const,

  // Colors - Pure High Contrast Dark
  background: "#000000",
  foreground: "#ffffff",
  primary: "#8ab4f8",
  secondary: "#9aa0a6",
  accent: "#aecbfa",

  // Surface colors
  surface: "rgba(32, 33, 36, 0.6)",
  surfaceHover: "rgba(41, 42, 45, 0.8)",
  surfaceBorder: "rgba(255, 255, 255, 0.15)",

  // Specific surface colors
  topBar: "#000000",
  topBarText: "#ffffff",
  topBarHover: "#202124",
  sidebar: "#000000",
  sidebarText: "#ffffff",
  sidebarHover: "#202124",
  sidebarActive: "#303134",
  responseCard: "#000000",

  // Text colors - PURE WHITE
  textPrimary: "#ffffff",
  textSecondary: "#ffffff", // Forced to white for high contrast
  textMuted: "#bdc1c6",

  // Button colors
  buttonPrimary: "#303134",
  buttonPrimaryText: "#ffffff",

  // Status colors
  success: "#81c995",
  warning: "#fdd663",
  error: "#f28b82",
  info: "#8ab4f8",

  // TOM specific
  calcExpColor: "#f28b82",
  anchorALinkColor: "#8ab4f8",
  spoilerBackground: "#ffffff",

  // Toast
  toastBackground: "#303134",
  toastText: "#ffffff",

  // Layout
  ...layout,
};

export const greyTheme = {
  mode: "grey" as const,

  // Colors - Classic Cream (Classic Reading Mode)
  background: "#fdf8ef",
  foreground: "#000000",
  primary: "#795548",
  secondary: "#a1887f",
  accent: "#5d4037",

  // Surface colors
  surface: "rgba(255, 255, 255, 0.5)",
  surfaceHover: "rgba(255, 255, 255, 0.8)",
  surfaceBorder: "rgba(0, 0, 0, 0.08)",

  // Specific surface colors
  topBar: "rgba(253, 248, 239, 0.95)",
  topBarText: "#000000",
  topBarHover: "#f1eee4",
  sidebar: "rgba(253, 248, 239, 0.8)",
  sidebarText: "#000000",
  sidebarHover: "#f1eee4",
  sidebarActive: "#e6e1d3",
  responseCard: "rgba(255, 255, 252, 0.6)",

  // Text colors - PURE BLACK
  textPrimary: "#000000",
  textSecondary: "#000000",
  textMuted: "#795548",

  // Button colors
  buttonPrimary: "#795548",
  buttonPrimaryText: "#ffffff",

  // Status colors
  success: "#4e7d4e",
  warning: "#b58d00",
  error: "#a83a3a",
  info: "#5b8ba1",

  // TOM specific
  calcExpColor: "#a83a3a",
  anchorALinkColor: "#795548",
  spoilerBackground: "#1a1a1a",

  // Toast
  toastBackground: "#5d4037",
  toastText: "#ffffff",

  // Layout
  ...layout,
};

export type ThemeMode = "light" | "dark" | "grey";
export type AppTheme = Omit<typeof lightTheme, "mode"> & { mode: ThemeMode };

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  grey: greyTheme,
} as const;
