import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  FormControlLabel,
  Icon,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { memoize } from "lodash";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { usePlayerSettings } from "../utils/storage";
import { parseVideoId } from "../utils/youtube";
import { BookmarkListPage } from "./bookmark-list-page";
import { SettingsPage } from "./settings-page";
import { SetupPage } from "./setup-page";
import { ShareTargetPage } from "./share-target";
import { WatchHistoryPage } from "./watch-history-page";
import { WatchPage } from "./watch-page";

function Header({ openMenu }: { openMenu: () => void }) {
  const navigate = useNavigate();
  const [input, setInput] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();

  function onEnter() {
    const videoId = parseVideoId(input);
    if (!videoId) {
      enqueueSnackbar("Input is invalid", { variant: "error" });
      return;
    }
    navigate(`/setup/${videoId}`);
  }

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            sx={{ marginRight: 2 }}
            onClick={openMenu}
          >
            <Icon>menu</Icon>
          </IconButton>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: "400px",
                display: "flex",
                borderRadius: 1,
                background: "hsl(0, 100%, 100%, 0.25)",
                transition: "background 200ms",
                ":focus-within, :hover": {
                  background: "hsl(0, 100%, 100%, 0.35)",
                },
              }}
            >
              <Box
                sx={{
                  flex: "0 0 40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon>search</Icon>
              </Box>
              <InputBase
                sx={{ color: "inherit", flexGrow: 1 }}
                placeholder="Enter URL or ID"
                value={input}
                onChange={({ target: { value } }) => setInput(value)}
                inputProps={{
                  onKeyUp: ({ key }) => key === "Enter" && onEnter(),
                }}
              />
              <Box
                sx={{
                  flex: "0 0 40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "opacity 200ms",
                  opacity: input ? 0.8 : 0,
                  ":hover": {
                    opacity: 1,
                  },
                }}
                onClick={() => setInput("")}
              >
                <Icon fontSize="small">close</Icon>
              </Box>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

const makeLinkBehavior = memoize((to: string) => {
  return React.forwardRef(function LinkBehavior(props, ref) {
    return <Link to={to} ref={ref as any} {...props} role={undefined} />;
  });
});

interface MenuEntry {
  to: string;
  icon: string;
  title: string;
}

const MENU_ENTRIES: MenuEntry[] = [
  {
    to: "/",
    icon: "home",
    title: "Home",
  },
  {
    to: "/settings",
    icon: "settings",
    title: "Settings",
  },
  {
    to: "/watch-history",
    icon: "history",
    title: "History",
  },
  {
    to: "/bookmarks",
    icon: "bookmarks",
    title: "Bookmarks",
  },
];

function Menu({ closeDrawer }: { closeDrawer: () => void }) {
  const [playerSettings, setPlayerSettings] = usePlayerSettings();

  return (
    <Box sx={{ width: "200px" }}>
      <List>
        {MENU_ENTRIES.map((entry) => (
          <ListItemButton
            key={entry.to}
            component={makeLinkBehavior(entry.to)}
            {...({ onClick: closeDrawer } as any)}
          >
            <ListItemIcon>
              <Icon>{entry.icon}</Icon>
            </ListItemIcon>
            <ListItemText primary={entry.title} />
          </ListItemButton>
        ))}
        <Divider />
        <ListSubheader>Player Settings</ListSubheader>
        <ListItem sx={{ pl: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={playerSettings.autoScroll}
                onChange={(event) =>
                  setPlayerSettings({
                    ...playerSettings,
                    autoScroll: event.target.checked,
                  })
                }
              />
            }
            label="Auto Scroll"
          />
        </ListItem>
      </List>
    </Box>
  );
}

function HomePage() {
  const videoIds = [
    "XrhqJmQnKAs",
    "MoH8Fk2K9bc",
    "vCb8iA4SjOI",
    "GZ2uc-3pQbA",
    "FSYe9GQc9Ow",
    "EnPYXckiUVg",
  ];

  return (
    <Box
      sx={{ padding: 1, height: 1, display: "flex", justifyContent: "center" }}
    >
      <Paper
        sx={{ padding: 1, height: 1, flex: "1 0 auto", maxWidth: "500px" }}
      >
        <Typography variant="h5">Examples</Typography>
        <List>
          {videoIds.map((videoId) => (
            <ListItem key={videoId}>
              <Link to={`/setup/${videoId}`}>{videoId}</Link>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <>
      <CssBaseline />
      <Drawer
        anchor={"left"}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Menu closeDrawer={() => setIsDrawerOpen(false)} />
      </Drawer>
      <Box
        sx={{
          height: 1,
          width: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "grey.50",
        }}
      >
        <Box sx={{ flex: "0 0 auto" }}>
          <Header openMenu={() => setIsDrawerOpen(true)} />
        </Box>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="setup/:videoId" element={<SetupPage />} />
          <Route path="watch" element={<WatchPage />} />
          <Route path="watch-history" element={<WatchHistoryPage />} />
          <Route path="bookmarks" element={<BookmarkListPage />} />
          <Route path="share-target" element={<ShareTargetPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Box>
    </>
  );
}
