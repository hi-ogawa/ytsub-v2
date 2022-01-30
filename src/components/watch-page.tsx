import { Box, CircularProgress, Fab, Icon, Zoom } from "@mui/material";
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
import { useBookmarkEntries, usePlayerSettings } from "../utils/storage";
import { CaptionEntry, VideoMetadata, WatchParameters } from "../utils/types";
import { useSearchParamsCustom } from "../utils/url";
import { withHook3 } from "../utils/with-hook";
import {
  captionConfigToUrl,
  DEFAULT_PLAYER_STATE,
  Player,
} from "../utils/youtube";
import { BOOKMARKABLE_CLASSNAME, PLAYER_STATE_SYNC_INTERVAL } from "./misc";
import { SubtitlesViewer } from "./subtitles-viewer";

// TODO: update watch history when success
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

function useSelection(filter?: (selection: Selection) => boolean) {
  const [selection, setSelection] = React.useState<Selection>();
  const listener = React.useCallback(() => {
    let selection = document.getSelection() ?? undefined;
    if (selection && filter && !filter(selection)) {
      selection = undefined;
    }
    setSelection(selection);
  }, []);
  React.useEffect(() => {
    document.addEventListener("selectionchange", listener);
    return () => document.removeEventListener("selectionchange", listener);
  }, []);
  return selection;
}

function isBookmarkSelection(selection: Selection): boolean {
  return !!(
    selection &&
    selection.toString().trim() &&
    selection.anchorNode &&
    selection.anchorNode === selection.focusNode &&
    selection.anchorNode.nodeType === document.TEXT_NODE &&
    selection.anchorNode.parentElement?.classList?.contains(
      BOOKMARKABLE_CLASSNAME
    )
  );
}

function findSelectionEntryIndex(selection: Selection): number {
  const textElement = selection.getRangeAt(0).startContainer;
  const entryNode = textElement.parentElement?.parentElement?.parentElement!;
  const entriesContainer = entryNode.parentElement!;
  const index = Array.from(entriesContainer.childNodes).findIndex(
    (other) => other === entryNode
  );
  return index;
}

function WatchPageOk({
  data: [watchParameters, _, captionEntries],
}: {
  data: [WatchParameters, VideoMetadata, CaptionEntry[]];
}) {
  const { videoId } = watchParameters;
  const [player, setPlayer] = React.useState<Player>(); // TODO: refactor so that we don't have to early return for `!player`
  const [playerState, setPlayerState] = React.useState(DEFAULT_PLAYER_STATE);
  const selection = useSelection(isBookmarkSelection);
  const addBookmark = useBookmarkEntries()[1];
  const { autoScroll } = usePlayerSettings()[0];

  const { currentTime, isPlaying } = playerState;
  const currentEntry = findCurrentEntry(captionEntries, currentTime);

  function setupPlayerStateSync(player: Player): () => void {
    // TODO: use youtube iframe api's `onStateChange` to monitor `isPlaying`
    const unsubscribe = setInterval(() => {
      setPlayerState(player.getState());
    }, PLAYER_STATE_SYNC_INTERVAL);
    return () => clearInterval(unsubscribe);
  }

  // TODO
  function repeatEntry() {}

  function onClickEntryPlay(entry: CaptionEntry, toggle: boolean) {
    if (!player) return;

    // No-op if some text is selected (e.g. for google translate extension)
    if (document.getSelection()?.toString()) return;

    if (toggle && entry === currentEntry) {
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

  function onClickCloseBookmark() {
    if (!selection) return;
    selection.removeAllRanges();
  }

  function onClickAddBookmark() {
    if (!selection) return;
    const bookmarkText = selection.toString().trim();
    const index = findSelectionEntryIndex(selection);
    const captionEntry = captionEntries[index];
    addBookmark({ watchParameters, captionEntry, bookmarkText });
    selection.removeAllRanges();
  }

  function scrollToEntry(entry: CaptionEntry) {
    const index = captionEntries.findIndex((other) => other === entry);
    if (index === -1) {
      return;
    }
    // TODO: ugly but works for now
    const parentSelector = "#watch-page-subtitles-viewer-box > :first-child";
    const childSelector = `:nth-child(${index + 1})`;
    const parent = document.querySelector<HTMLElement>(parentSelector)!;
    const child = parent.querySelector<HTMLElement>(childSelector)!;
    const hp = parent.clientHeight;
    const hc = child.clientHeight;
    const op = parent.offsetTop;
    const oc = child.offsetTop;
    parent.scroll({ top: oc - op + hc / 2 - hp / 2, behavior: "smooth" });
  }

  // Setup `playerState` synchronization
  React.useEffect(() => {
    if (!player) return;
    return setupPlayerStateSync(player);
  }, [!!player]);

  // Handle repeating entry
  React.useEffect(() => {
    if (!player || !isPlaying) return;
    repeatEntry();
  }, [currentTime]);

  // Handle auto scroll
  React.useEffect(() => {
    if (autoScroll && currentEntry) {
      scrollToEntry(currentEntry);
    }
  }, [autoScroll, currentEntry]);

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
          padding: 0,
          gap: 0,
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
      <Box id="watch-page-subtitles-viewer-box" sx={{ postition: "relative" }}>
        <SubtitlesViewer
          captionEntries={captionEntries}
          currentEntry={currentEntry}
          onClickEntryPlay={onClickEntryPlay}
          onClickEntryRepeat={onClickEntryRepeat}
          playerState={playerState}
        />
        <Zoom in={!!selection}>
          <Box
            sx={{
              position: "absolute",
              padding: 1.5,
              paddingTop: 0,
              bottom: 0,
              right: 0,
              display: "flex",
              gap: 1.5,
            }}
          >
            <Fab color="secondary" onClick={onClickCloseBookmark}>
              <Icon>close</Icon>
            </Fab>
            <Fab color="primary" onClick={onClickAddBookmark}>
              <Icon>bookmark</Icon>
            </Fab>
          </Box>
        </Zoom>
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
