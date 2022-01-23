import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  Icon,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { parseVideoId } from "../utils/youtube";
import { SetupPage } from "./setup-page";
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
        <Box sx={{ flex: "1 0 auto", display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            sx={{ marginRight: 3 }}
            onClick={openMenu}
          >
            <Icon>menu</Icon>
          </IconButton>
          <Box
            sx={{ flex: "1 0 auto", display: "flex", justifyContent: "center" }}
          >
            <Box
              sx={{
                flex: "1 0 auto",
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
                sx={{ color: "inherit", flex: "1 0 auto" }}
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

function Menu() {
  const LinkBehavior = React.forwardRef(function LinkBehavior(props, ref) {
    return <Link to="/" ref={ref as any} {...props} role={undefined} />;
  });

  return (
    <Box sx={{ width: "200px" }}>
      <List>
        <ListItem button component={LinkBehavior}>
          <ListItemText primary="Home" />
        </ListItem>
      </List>
    </Box>
  );
}

function HomePage() {
  const videoIds = ["XrhqJmQnKAs", "MoH8Fk2K9bc"];

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
        <Menu />
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
          <Route path="setup/:videoId" element={<SetupPage />} />
          <Route path="watch" element={<WatchPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Box>
    </>
  );
}
