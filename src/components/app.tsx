import * as React from "react";
import {
  AppBar,
  Box,
  Card,
  CssBaseline,
  Drawer,
  Toolbar,
  IconButton,
  Icon,
  InputBase,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  InputAdornment,
  Button,
  MenuItem,
  ListSubheader,
  TextFieldProps,
} from "@mui/material";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
  Link,
} from "react-router-dom";
import { useSnackbar } from "notistack";
import { useQuery, UseQueryOptions } from "react-query";
import { proxyFetch } from "../utils/proxy";
import {
  parseVideoId,
  parseVideoMetadata,
  VideoMetadata,
} from "../utils/youtube";
import { FILTERED_LANGUAGE_CODES, languageCodeToName } from "../utils/misc";

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
    navigate(`/search/${videoId}`);
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

export function Player({ videoId }: { videoId: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "100%",
          maxWidth: { xs: "600px", md: "initial" },
          boxShadow: 3,
        }}
      >
        <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: "100%",
            }}
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
          />
        </Box>
      </Box>
    </Box>
  );
}

function SubtitlesViewer() {
  return (
    <Card
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Typography variant="h5">SUBTITLES VIEWER</Typography>
    </Card>
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

interface CaptionConfig {
  // e.g. ".en", ".fr", (manual caption) "a.fr" (auto caption)
  vssId: string;
  // e.g. "en", "fr"
  languageCode: string;
  translationLanguageCode?: string;
}

// @ts-ignore
interface WatchParameters {
  videoId: string;
  captionConfig1: CaptionConfig;
  captionConfig2: CaptionConfig;
}

function WatchPage() {
  // useSearchParams to get captionConfig1 and captionConfig2
  const { videoId = "" } = useParams();
  const navigate = useNavigate();
  const { refetch, data } = useVideoMetadata(videoId, {
    onError: (error) => {
      console.error(error);
      navigate("/");
    },
    enabled: false,
  });

  React.useEffect(() => {
    if (!videoId) {
      navigate("/");
      return;
    }
    if (!data) {
      refetch();
    }
  }, []);

  if (!videoId || !data) {
    return (
      <Box
        sx={{
          flex: "1 0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        flex: "1 1 auto",
        display: "flex",
        padding: 1,
        gap: 1,

        "#main-player-box": {
          display: "flex",
          "& > *": {
            flex: "1 0 auto",
          },
        },

        "#main-subtitles-viewer-box": {
          flex: "1 0 auto",
          display: "flex",
          "& > *": {
            flex: "1 0 auto",
          },
        },

        // Split vertically by the height of `#main-player-box` defined by aspect ratio `width * 9 / 16`
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",

          "#main-player-box": {
            flex: "0 0 auto",
          },
        },

        // Split horizontally by 2/3 and 1/3
        [theme.breakpoints.up("md")]: {
          flexDirection: "row",

          "#main-player-box": {
            flex: "0 0 66%",
            alignSelf: "start",
          },
        },
      })}
    >
      <Box id="main-player-box">
        <Player videoId={videoId} />
      </Box>
      <Box id="main-subtitles-viewer-box">
        <SubtitlesViewer />
      </Box>
    </Box>
  );
}

// DefaultOptions
function createUseQuery<TQueryFnArg, TQueryFnData>(
  key: any,
  queryFnWithArg: (arg: TQueryFnArg) => Promise<TQueryFnData>,
  defaultOptions?: Pick<UseQueryOptions<TQueryFnData, Error, null>, "cacheTime">
) {
  return function useQueryWrapper<TData = TQueryFnData>(
    arg: TQueryFnArg,
    options?: Omit<
      UseQueryOptions<TQueryFnData, Error, TData>,
      "queryKey" | "queryFn"
    >
  ) {
    return useQuery<TQueryFnData, Error, TData>(
      [key, arg],
      () => queryFnWithArg(arg),
      { ...defaultOptions, ...options }
    );
  };
}

const useVideoMetadata = createUseQuery(
  "video-metadata",
  async (videoId: string) => {
    const response = await proxyFetch(
      `https://www.youtube.com/watch?v=${videoId}`,
      { headers: { "accept-language": "en-US,en" } }
    );
    const metadata = parseVideoMetadata(response);
    if (metadata.playabilityStatus.status !== "OK") {
      console.error(metadata);
      throw new Error("Invalid video metadata");
    }
    return metadata;
  }
);

function renderCaptionConfigSelectOptions(
  videoMetadata: VideoMetadata
): React.ReactNode[] {
  const { captionTracks, translationLanguages } =
    videoMetadata.captions.playerCaptionsTracklistRenderer;

  const children: React.ReactNode[] = [];

  children.push(
    <ListSubheader key={`group-captions`}>
      <Box sx={{ opacity: 0.8, textTransform: "uppercase" }}>Captions</Box>
    </ListSubheader>
  );

  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const value = JSON.stringify({ vssId, languageCode });
    children.push(
      <MenuItem key={value} value={value} sx={{ marginLeft: 2 }}>
        {languageCodeToName(languageCode, kind)}
      </MenuItem>
    );
  }

  for (const track of captionTracks) {
    const { vssId, languageCode, kind } = track;
    const value = JSON.stringify({ vssId, languageCode });
    children.push(
      <ListSubheader key={`group-translations-${value}`}>
        <Box sx={{ opacity: 0.8, textTransform: "uppercase" }}>
          Auto Translations ({languageCodeToName(languageCode, kind)})
        </Box>
      </ListSubheader>
    );

    for (const translation of translationLanguages) {
      const code = translation.languageCode;
      if (!FILTERED_LANGUAGE_CODES.includes(code as any)) {
        continue;
      }
      const value = JSON.stringify({
        vssId,
        languageCode,
        translationLanguageCode: code,
      });
      children.push(
        <MenuItem key={value} value={value} sx={{ marginLeft: 2 }}>
          {languageCodeToName(translation.languageCode)}
        </MenuItem>
      );
    }
  }

  return children;
}

function CaptionConfigSelect({
  videoMetadata,
  value,
  onChange,
  ...props
}: {
  videoMetadata?: VideoMetadata;
  value?: CaptionConfig;
  onChange: (value?: CaptionConfig) => void;
} & Omit<TextFieldProps, "value" | "onChange">) {
  const children: React.ReactNode[] = [
    <MenuItem
      key=""
      value=""
      sx={{
        fontSize: "0.8rem",
        opacity: 0.5,
        display: "flex",
        justifyContent: "center",
      }}
    >
      SELECT LANGUAGE
    </MenuItem>,
  ];
  if (videoMetadata) {
    children.push(...renderCaptionConfigSelectOptions(videoMetadata));
  }
  return (
    <TextField
      {...props}
      select
      value={value ? JSON.stringify(value) : ""}
      onChange={({ target: { value } }) => {
        onChange(value ? JSON.parse(value) : undefined);
      }}
    >
      {children}
    </TextField>
  );
}

function SearchPageInner({ videoId }: { videoId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    data: videoMetadata,
    isSuccess,
    isLoading,
    isError,
  } = useVideoMetadata(videoId, {
    onError: (error) => {
      console.error(error);
      enqueueSnackbar("Failed to load captions data");
    },
  });

  const [caption1, setCaption1] = React.useState<CaptionConfig>();
  const [caption2, setCaption2] = React.useState<CaptionConfig>();

  function onPlay() {
    if (!caption1 || !caption2) return;

    navigate(`/watch/${videoId}`);
  }

  return (
    <Box
      sx={{
        flex: "1 0 auto",
        display: "flex",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Card
        sx={{
          flex: "1 0 auto",
          maxWidth: "500px",
          height: 1,
          padding: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography variant="h5">Select Languages</Typography>
        <TextField
          label="Video ID"
          value={videoId}
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          error={isError}
          InputProps={{
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={25} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Author"
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          inputProps={{ style: { textOverflow: "ellipsis" } }}
          disabled={!isSuccess}
          value={videoMetadata ? videoMetadata.videoDetails.author : "----"}
        />
        <TextField
          label="Title"
          variant="filled"
          sx={{ marginBottom: 1, pointerEvents: "none" }}
          inputProps={{ style: { textOverflow: "ellipsis" } }}
          disabled={!isSuccess}
          value={videoMetadata ? videoMetadata.videoDetails.title : "----"}
        />
        <CaptionConfigSelect
          label="1st language"
          disabled={!isSuccess}
          videoMetadata={videoMetadata}
          value={caption1}
          onChange={setCaption1}
        />
        <CaptionConfigSelect
          label="2nd language"
          disabled={!isSuccess}
          videoMetadata={videoMetadata}
          value={caption2}
          onChange={setCaption2}
        />
        <Button
          onClick={onPlay}
          variant="contained"
          disabled={!isSuccess || !caption1 || !caption2}
        >
          Play
        </Button>
      </Card>
    </Box>
  );
}

function SearchPage() {
  const { videoId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  if (!videoId) {
    enqueueSnackbar("Video ID is invalid", { variant: "error" });
    return <Navigate to="/" />;
  }
  return <SearchPageInner videoId={videoId} />;
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
            <ListItem>
              <Link to={`/search/${videoId}`}>{videoId}</Link>
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
        }}
      >
        <Box sx={{ flex: "0 0 auto" }}>
          <Header openMenu={() => setIsDrawerOpen(true)} />
        </Box>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="search/:videoId" element={<SearchPage />} />
          <Route path="watch/:videoId" element={<WatchPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </Box>
    </>
  );
}
