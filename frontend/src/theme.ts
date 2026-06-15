import { createTheme } from "@mui/material/styles";

// A calm, professional palette: deep indigo primary, teal accent, soft surface
// greys. Slightly rounded corners and restrained shadows so the app reads as
// trustworthy enterprise HR software rather than a default MUI template.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3949ab", dark: "#283593", light: "#5c6bc0" },
    secondary: { main: "#00897b" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
    success: { main: "#2e7d32" },
    warning: { main: "#ed6c02" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: "1px solid #e6e9f2" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});
