import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  type Theme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PaidIcon from "@mui/icons-material/Paid";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;

const NAV = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/employees", label: "Employees", icon: <PeopleIcon /> },
  { to: "/analytics", label: "Analytics", icon: <BarChartIcon /> },
  { to: "/insights", label: "AI Insights", icon: <PsychologyIcon /> },
];

export default function MainLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const toggleDrawer = () => setOpen((prev) => !prev);

  const drawerTransition = (t: Theme) =>
    t.transitions.create("width", {
      easing: t.transitions.easing.sharp,
      duration: t.transitions.duration.enteringScreen,
    });

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            aria-label={open ? "Close menu" : "Open menu"}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <PaidIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            ACME&nbsp;·&nbsp;Salary Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: drawerTransition,
          [`& .MuiDrawer-paper`]: {
            width: open ? DRAWER_WIDTH : 0,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: open ? "1px solid #e6e9f2" : "none",
            transition: drawerTransition,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", py: 1 }}>
          <List>
            {NAV.map((item) => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={isActive(item.to)}
                onClick={() => setOpen(false)}
                sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
          width: "100%",
          transition: drawerTransition,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
