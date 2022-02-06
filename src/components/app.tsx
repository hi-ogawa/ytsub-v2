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
import { PracticePage } from "./practice-page";
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
  const ref = React.useRef<HTMLInputElement>(null);

  function openInput() {
    ref.current?.focus();
    setInput("");
    setOpen(true);
  }

  function closeInput() {
    ref.current?.blur();
    setInput("");
    setOpen(false);
  }

  function onEnter() {
    const videoId = parseVideoId(input);
    if (!videoId) {
      enqueueSnackbar("Input is invalid", { variant: "error" });
      return;
    }
    navigate(`/setup/${videoId}`);
  }

  return (
    <div
      className={`
        relative items-center flex items-center
        transition-[background-color] duration-700 ease-in-out
        ${open ? "bg-white/60" : "bg-white/0"}
      `}
    >
      <div
        className="font-icon text-2xl px-2 select-none"
        onClick={() => (open ? closeInput() : openInput())}
      >
        search
      </div>
      <input
        ref={ref}
        className={`
          flex-1 min-w-0 w-full text-base bg-transparent placeholder:text-white/70 outline-0
          transition-[padding,width] duration-700 ease-in-out
          ${open ? "w-40 pr-8" : "w-0 pr-0"}
        `}
        placeholder="Enter URL or ID"
        value={input}
        onChange={({ target: { value } }) => setInput(value)}
        onKeyUp={({ key }) => key === "Enter" && onEnter()}
      />
      {open && input && (
        <div
          className={`
              absolute right-0 px-2
              font-icon text-base cursor-pointer select-none
            `}
          onClick={() => setInput("")}
        >
          close
        </div>
      )}
    </div>
  );
}

function Header({ openMenu }: { openMenu: () => void }) {
  // TODO: refactor with `MENU_ENTRIES` below
  const title = (
    <Routes>
      <Route
        path="watch-history"
        element={<div className="text-lg">History</div>}
      />
      <Route
        path="bookmarks"
        element={<div className="text-lg">Bookmarks</div>}
      />
      <Route
        path="practice"
        element={<div className="text-lg">Practice</div>}
      />
      <Route path="dev" element={<div className="text-lg">Dev</div>} />
      <Route path="*" element={null} />
    </Routes>
  );

  const search = (
    <Routes>
      <Route path="watch-history" element={null} />
      <Route path="bookmarks" element={null} />
      <Route path="practice" element={null} />
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
          {title}
          <div className="flex-1"></div>
          {search}
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
  {
    to: "/practice",
    icon: "school",
    title: "Practice",
  },
  {
    to: "/dev",
    icon: "developer_mode",
    title: "Dev",
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
          <Route path="practice" element={<PracticePage />} />
          <Route path="share-target" element={<ShareTargetPage />} />
          <Route path="dev" element={<DevPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Box>
    </>
  );
}
