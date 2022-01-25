import { Box, CircularProgress, Icon, Paper } from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { Navigate } from "react-router-dom";
import { Err, Ok, Result } from "ts-results";
import * as assert from "../utils/assert";
import {
  useCaptionEntries,
  useVideoMetadata,
  useYoutubeApi,
} from "../utils/hooks";
import { CaptionEntry, VideoMetadata, WatchParameters } from "../utils/types";
import { useSearchParamsCustom } from "../utils/url";
import { withHook3 } from "../utils/with-hook";
import {
  captionConfigToUrl,
  DEFAULT_PLAYER_STATE,
  Player,
  PlayerState,
  stringifyTimestamp,
} from "../utils/youtube";

// TODO: Split components for better react refresh

export const WatchPage = withHook3(
  (): Result<WatchParameters, "error" | "loading"> => {
    // Load youtube api script as early as possible
    useYoutubeApi(null);

    // TODO: validate
    const watchParameters = useSearchParamsCustom<WatchParameters>();
    if (!watchParameters.ok) {
      console.error(watchParameters.val);
      return Err("error");
    }
    return Ok(watchParameters.val);
  },
  (
    watchParameters: WatchParameters
  ): Result<
    [WatchParameters, VideoMetadata, string, string],
    "error" | "loading"
  > => {
    const {
      videoId,
      captions: [captionConfig1, captionConfig2],
    } = watchParameters;
    const {
      data: videoMetadata,
      isLoading,
      isError,
    } = useVideoMetadata(videoId);
    if (isError) {
      return Err("error");
    }
    if (isLoading) {
      return Err("loading");
    }
    assert.ok(videoMetadata);
    const url1 = captionConfigToUrl(captionConfig1, videoMetadata);
    const url2 = captionConfigToUrl(captionConfig2, videoMetadata);
    if (!url1 || !url2) {
      return Err("error");
    }
    return Ok([watchParameters, videoMetadata, url1, url2]);
  },
  ([watchParameters, videoMetadata, url1, url2]: [
    WatchParameters,
    VideoMetadata,
    string,
    string
  ]): Result<
    [WatchParameters, VideoMetadata, CaptionEntry[]],
    "error" | "loading"
  > => {
    const {
      data: captionEntries,
      isLoading,
      isError,
    } = useCaptionEntries([url1, url2]);
    if (isError) {
      return Err("error");
    }
    if (isLoading) {
      return Err("loading");
    }
    assert.ok(captionEntries);
    return Ok([watchParameters, videoMetadata, captionEntries]);
  },
  WatchPageOk,
  WatchPageErr
);

function findCurrentEntry(
  entries: CaptionEntry[],
  time: number
): CaptionEntry | undefined {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].begin <= time) {
      return entries[i];
    }
  }
  return;
}

const PLAYER_STATE_SYNC_INTERVAL = 200;

function WatchPageOk({
  data: [watchParameters, _, captionEntries],
}: {
  data: [WatchParameters, VideoMetadata, CaptionEntry[]];
}) {
  const { videoId } = watchParameters;
  const [player, setPlayer] = React.useState<Player>(); // TODO: refactor so that we don't have to early return for `!player`
  const [playerState, setPlayerState] = React.useState(DEFAULT_PLAYER_STATE);

  const { currentTime, isPlaying } = playerState;
  const currentEntry = findCurrentEntry(captionEntries, currentTime);

  function setupPlayerStateSync(player: Player): () => void {
    const unsubscribe = setInterval(() => {
      setPlayerState(player.getState());
    }, PLAYER_STATE_SYNC_INTERVAL);
    return () => clearInterval(unsubscribe);
  }

  // TODO
  function repeatEntry() {}

  function onClickEntryPlay(entry: CaptionEntry) {
    if (!player) return;

    // No-op if some text is selected (e.g. for google translate extension)
    if (document.getSelection()?.toString()) return;

    if (entry === currentEntry) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } else {
      player.seekTo(entry.begin);
      player.playVideo();
    }
  }

  // TODO
  function onClickEntryRepeat() {}

  // Setup `playerState` synchronization
  React.useEffect(() => {
    if (!player) return;
    return setupPlayerStateSync(player);
  }, [!!player]);

  // Handle repeating entry
  React.useEffect(() => {
    if (!player || !isPlaying) return;
    repeatEntry();
    return;
  }, [currentTime]);

  return (
    <Box
      sx={(theme) => ({
        flex: "1 1 auto",
        display: "flex",
        padding: 1,
        gap: 1,

        "#watch-page-player-box": {
          display: "flex",
          "& > *": {
            flex: "1 0 auto",
          },
        },

        "#watch-page-subtitles-viewer-box": {
          flex: "1 0 0",
          display: "flex",
          flexDirection: "column",

          "& > *": {
            flex: "1 0 0",
            overflowY: "auto",
          },
        },

        // Split vertically by the height of `#watch-page-player-box` defined by aspect ratio `width * 9 / 16`
        [theme.breakpoints.down("md")]: {
          flexDirection: "column",

          "#watch-page-player-box": {
            flex: "0 0 auto",
          },
        },

        // Split horizontally by 2/3 and 1/3
        [theme.breakpoints.up("md")]: {
          flexDirection: "row",

          "#watch-page-player-box": {
            flex: "0 0 66%",
            alignSelf: "start",
          },
        },
      })}
    >
      <Box id="watch-page-player-box">
        <PlayerComponent videoId={videoId} setPlayer={setPlayer} />
      </Box>
      <Box id="watch-page-subtitles-viewer-box">
        <SubtitlesViewer
          captionEntries={captionEntries}
          currentEntry={currentEntry}
          onClickEntryPlay={onClickEntryPlay}
          onClickEntryRepeat={onClickEntryRepeat}
          playerState={playerState}
        />
      </Box>
    </Box>
  );
}

function WatchPageErr({ data }: { data: "error" | "loading" }) {
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (data === "error") {
      enqueueSnackbar("Invalid Video ID");
    }
  }, [data]);

  if (data === "loading") {
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
  return <Navigate to="/" />;
}

export function PlayerComponent({
  videoId,
  setPlayer,
}: {
  videoId: string;
  setPlayer: (player: Player | undefined) => void;
}) {
  const playerEl = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    // TODO: cleanup
    assert.ok(playerEl.current);
    Player.create(playerEl.current, {
      videoId,
      width: 400,
      height: 225,
      playerVars: {
        autoplay: 0,
        start: 0,
      },
    }).then(setPlayer);
    return;
  }, []);

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          flex: "0 0 auto",
          width: "100%",
          maxWidth: { xs: "480px", md: "initial" },
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%",
            "& > :first-of-type": {
              position: "absolute",
              top: 0,
              width: 1,
              height: 1,
            },
          }}
        >
          {/* Replaced with <iframe /> via `new Player(...)` */}
          <div ref={playerEl as any} />
        </Box>
      </Box>
    </Box>
  );
}

function SubtitlesViewer({
  captionEntries,
  currentEntry,
  onClickEntryPlay,
  onClickEntryRepeat,
  playerState,
}: {
  captionEntries: CaptionEntry[];
  currentEntry: CaptionEntry | undefined;
  onClickEntryPlay: (entry: CaptionEntry) => void;
  onClickEntryRepeat: (entry: CaptionEntry) => void;
  playerState: PlayerState;
}) {
  return (
    <Paper
      variant="outlined"
      square
      sx={{ display: "flex", flexDirection: "column", padding: 0.8, gap: 0.8 }}
    >
      {captionEntries.map((e) => (
        <CaptionEntryComponent
          key={toCaptionEntryId(e)}
          entry={e}
          currentEntry={currentEntry}
          onClickEntryPlay={onClickEntryPlay}
          onClickEntryRepeat={onClickEntryRepeat}
          playerState={playerState}
        />
      ))}
    </Paper>
  );
}

function CaptionEntryComponent({
  entry,
  currentEntry,
  onClickEntryPlay,
  onClickEntryRepeat,
  playerState,
}: {
  entry: CaptionEntry;
  currentEntry: CaptionEntry | undefined;
  onClickEntryPlay: (entry: CaptionEntry) => void;
  onClickEntryRepeat: (entry: CaptionEntry) => void;
  playerState: PlayerState;
}) {
  const { begin, end, text1, text2 } = entry;
  const timestamp = [begin, end].map(stringifyTimestamp).join(" - ");
  const { isPlaying } = playerState;
  const isCurrentEntry = entry === currentEntry;
  const isCurrentEntryPlaying = isCurrentEntry && isPlaying;

  return (
    <Paper
      variant="outlined"
      square
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          padding: 0.8,
          fontSize: 12,
        },
        isCurrentEntry && {
          backgroundColor: "grey.100",
        },
        isCurrentEntryPlaying && {
          marginLeft: "-1px",
          borderLeftWidth: "2px",
          borderLeftStyle: "solid",
          borderLeftColor: "primary.light",
        },
      ]}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        <Box sx={{ fontSize: 12, color: "grey.700" }}>{timestamp}</Box>
        <Box
          sx={{ fontSize: 16, color: "grey.500", display: "flex", gap: 0.8 }}
        >
          {/* TODO: implement "repeat" action */}
          <Icon
            sx={{ fontSize: 16, display: "none", cursor: "pointer" }}
            onClick={() => onClickEntryRepeat(entry)}
          >
            repeat
          </Icon>
          <Icon
            sx={[
              { fontSize: 16, cursor: "pointer" },
              isCurrentEntryPlaying && {
                color: "primary.light",
              },
            ]}
            onClick={() => onClickEntryPlay(entry)}
          >
            play_circle_outline
          </Icon>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          "> *": {
            flex: "1 1 50%",
            "&:first-of-type": {
              paddingRight: 0.8,
              borderRightWidth: "1px",
              borderRightStyle: "solid",
              borderRightColor: "grey.300",
            },
            "&:not(:first-of-type)": {
              paddingLeft: 0.8,
            },
          },
          cursor: "pointer",
        }}
        onClick={() => onClickEntryPlay(entry)}
      >
        <Box>{text1}</Box>
        <Box>{text2}</Box>
      </Box>
    </Paper>
  );
}

function toCaptionEntryId({ begin, end }: CaptionEntry): string {
  return `${begin}--${end}`;
}
