import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Icon,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { memoize } from "lodash";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { parseVideoId } from "../utils/youtube";
import { BookmarkListPage } from "./bookmark-list-page";
import { DevPage } from "./dev-page";
import { HomePage } from "./home-page";
import { SettingsPage } from "./settings-page";
import { SetupPage } from "./setup-page";
import { ShareTargetPage } from "./share-target";
import { WatchHistoryPage } from "./watch-history-page";
import { WatchPage, WatchPageMenu } from "./watch-page";

function HeaderSearchInput() {
  const navigate = useNavigate();
  const [input, setInput] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  function openInput() {
    setInput("");
    setOpen(true);
  }

  function closeInput() {
    setInput("");
    setOpen(false);
  }

  function onEnter() {
    closeInput();
    const videoId = parseVideoId(input);
    if (!videoId) {
      enqueueSnackbar("Input is invalid", { variant: "error" });
      return;
    }
    navigate(`/setup/${videoId}`);
  }

  // TODO: animation
  return open ? (
    <label className="relative items-center flex items-center bg-white/50 hover:bg-white/60 focus-within:bg-white/60">
      <div className="font-icon text-2xl px-2">search</div>
      <input
        className="flex-1 min-w-0 w-full text-base bg-transparent placeholder:text-white/80 outline-0 mr-6"
        placeholder="Enter URL or ID"
        value={input}
        onChange={({ target: { value } }) => setInput(value)}
        onKeyUp={({ key }) => key === "Enter" && onEnter()}
      />
      <div
        className="absolute right-0 font-icon text-base px-2 cursor-pointer"
        onClick={closeInput}
      >
        close
      </div>
    </label>
  ) : (
    <div
      className="items-center flex items-center cursor-pointer"
      onClick={openInput}
    >
      <div className="font-icon text-2xl px-2">search</div>
    </div>
  );
}

function Header({ openMenu }: { openMenu: () => void }) {
  // TODO: Is there something better than ad-hoc Routes/Route?

  const title = (
    <Routes>
      <Route path="*" element={<HeaderSearchInput />} />
    </Routes>
  );

  const menu = (
    <Routes>
      <Route path="watch" element={<WatchPageMenu />} />
      <Route path="*" element={null} />
    </Routes>
  );

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            sx={{ marginRight: 1 }}
            onClick={openMenu}
          >
            <Icon>menu</Icon>
          </IconButton>
          <div className="flex-1"></div>
          {title}
          {menu}
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
      </List>
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
        <Box sx={{ flex: "0 0 auto", zIndex: 1 }}>
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
          <Route path="dev" element={<DevPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Box>
    </>
  );
}
