import { Icon, IconButton, Menu } from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { createGlobalState } from "react-use";
import * as assert from "../utils/assert";
import { keys } from "../utils/lodash-extra";
import { useBookmarkEntries, usePracticeSystem } from "../utils/storage";
import {
  BookmarkEntry,
  CaptionEntry,
  VideoId,
  groupBookmarkEntries,
} from "../utils/types";
import { useNavigateCustom } from "../utils/url";
import { DEFAULT_PLAYER_STATE, Player } from "../utils/youtube";
import { PLAYER_STATE_SYNC_INTERVAL } from "./misc";
import { CaptionEntryComponent } from "./subtitles-viewer";

const useSelectedVideoId = createGlobalState<VideoId | undefined>();

// TODO: Show guide when there's no bookmark
export function BookmarkListPage() {
  const [entries, _, removeEntry] = useBookmarkEntries();
  const [selected, selectVideoId] = useSelectedVideoId();
  const groupedEntries = groupBookmarkEntries(entries);
  const videoIds = keys(groupedEntries);
  const entriesToList = (selected && groupedEntries[selected]) || entries;

  function onRemoveEntry(entry: BookmarkEntry) {
    removeEntry(entry);
  }

  React.useEffect(() => {
    selectVideoId(undefined);
  }, []);

  return (
    <div className="sm:p-4 h-full flex justify-center">
      <div
        className="
          w-full sm:max-w-lg
          h-full
          flex flex-col
          sm:border border-solid border-gray-200
        "
      >
        {videoIds.length > 0 ? (
          <>
            <div className="p-2 flex-none bg-gray-50 flex items-center justify-content gap-2 overflow-x-auto">
              {videoIds.map((videoId) => (
                <div
                  key={videoId}
                  className={`
                      flex-none w-40 aspect-video relative overflow-hidden cursor-pointer
                      ${selected && selected !== videoId && "opacity-40"}
                    `}
                  onClick={() =>
                    selectVideoId(selected === videoId ? undefined : videoId)
                  }
                >
                  <img
                    className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
                    src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  />
                </div>
              ))}
            </div>
            <div className="flex-[1_0_0] overflow-y-auto bg-white">
              <div className="flex flex-col p-2 gap-2">
                {entriesToList.map((entry) => (
                  <BookmarkEntryComponent
                    key={entry.bookmarkText}
                    entry={entry}
                    onRemoveEntry={onRemoveEntry}
                    autoplay={false}
                    defaultIsRepeating={false}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-white text-xl text-gray-500">
            Empty Bookmark
          </div>
        )}
      </div>
    </div>
  );
}

export function BookmarkEntryComponent({
  entry,
  onRemoveEntry,
  openOverride,
  autoplay,
  defaultIsRepeating,
}: {
  entry: BookmarkEntry;
  onRemoveEntry?: React.Dispatch<BookmarkEntry>;
  openOverride?: boolean;
  autoplay: boolean;
  defaultIsRepeating: boolean;
}) {
  let [open, setOpen] = React.useState(false);
  const isOpenOverride = typeof openOverride === "boolean";

  if (isOpenOverride) {
    open = openOverride;
  }

  return (
    <div
      className="
        border border-solid border-gray-200
        flex flex-col
      "
    >
      <div
        className="
        flex items-center
        p-2 gap-2
      "
      >
        {isOpenOverride ? null : (
          <span
            className="font-icon flex-none text-gray-500 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {open ? "expand_less" : "expand_more"}
          </span>
        )}
        <div
          className="grow text-sm cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {entry.bookmarkText}
        </div>
        {onRemoveEntry && (
          <span
            className="font-icon flex-none text-gray-500 cursor-pointer"
            onClick={() => onRemoveEntry(entry)}
          >
            close
          </span>
        )}
      </div>
      {open && (
        <MiniPlayer
          entry={entry}
          autoplay={autoplay}
          defaultIsRepeating={defaultIsRepeating}
        />
      )}
    </div>
  );
}

// TODO: refactor with WatchPageOk
function MiniPlayer({
  entry,
  autoplay,
  defaultIsRepeating,
}: {
  entry: BookmarkEntry;
  autoplay: boolean;
  defaultIsRepeating: boolean;
}) {
  const navigate = useNavigateCustom();
  const [player, setPlayer] = React.useState<Player>();
  const [playerState, setPlayerState] = React.useState(DEFAULT_PLAYER_STATE);
  const [isRepeating, setIsRepeating] = React.useState(defaultIsRepeating);

  const { captionEntry, watchParameters } = entry;
  const { videoId } = watchParameters;
  const { currentTime, isPlaying } = playerState;

  const { begin, end } = entry.captionEntry;
  const beginFloor = Math.max(0, Math.floor(begin) - 1);

  function setupPlayerStateSync(player: Player): () => void {
    // TODO: use youtube iframe api's `onStateChange` to monitor `isPlaying`
    const unsubscribe = setInterval(() => {
      setPlayerState(player.getState());
    }, PLAYER_STATE_SYNC_INTERVAL);
    if (autoplay) {
      // autoplay option of iframe doesn't seem to work
      player.playVideo();
    }
    return () => clearInterval(unsubscribe);
  }

  function repeatEntry() {
    if (!player || !isRepeating) return;
    if (currentTime < beginFloor || end < currentTime) {
      player.seekTo(beginFloor);
    }
  }

  function onClickEntryPlay(entry: CaptionEntry, toggle: boolean) {
    if (!player) return;

    if (toggle) {
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

  function onClickEntryRepeat() {
    setIsRepeating(!isRepeating);
    if (player && !isPlaying) {
      player.playVideo();
    }
  }

  function onClickEntrySearch(_: CaptionEntry) {
    navigate("/watch", watchParameters);
  }

  // Setup `playerState` synchronization
  React.useEffect(() => {
    if (!player) return;
    return setupPlayerStateSync(player);
  }, [!!player]);

  // Handle repeating entry
  React.useEffect(() => {
    repeatEntry();
  }, [currentTime]);

  return (
    <div className="flex flex-col w-full">
      <PlayerComponent
        videoId={videoId}
        setPlayer={setPlayer}
        start={beginFloor}
      />
      <CaptionEntryComponent
        entry={captionEntry}
        isCurrentEntry={false}
        isRepeating={isRepeating}
        onClickEntryPlay={onClickEntryPlay}
        onClickEntryRepeat={onClickEntryRepeat}
        onClickEntrySearch={onClickEntrySearch}
        playerState={playerState}
        border={false}
      />
    </div>
  );
}

// TODO: refactor with watch-page.tsx
export function PlayerComponent({
  videoId,
  setPlayer,
  start,
}: {
  videoId: string;
  setPlayer: (player: Player | undefined) => void;
  start: number;
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
        start,
      },
    }).then(setPlayer);
    return;
  }, []);

  return (
    <div className="w-full aspect-video relative">
      {/* Mutated by youtube iframe api */}
      <div className="absolute w-full h-full top-0" ref={playerEl as any} />
    </div>
  );
}

export function BookmarkListPageMenu() {
  const [entries] = useBookmarkEntries();
  const [system, setSystem] = usePracticeSystem();
  const [selected] = useSelectedVideoId();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const { enqueueSnackbar } = useSnackbar();

  function openMenuOnClick(event: any) {
    setAnchorEl(event.currentTarget as HTMLElement);
  }

  function closeMenu() {
    setAnchorEl(undefined);
  }

  // TODO: prevent adding duplicates
  function addToDeck() {
    if (!selected) return;

    const selectedEntries = groupBookmarkEntries(entries)[selected];
    if (!selectedEntries) return;

    for (const entry of selectedEntries) {
      system.addNewEntry(entry);
    }
    setSystem(system);
    enqueueSnackbar("Added bookmarks to a deck", { variant: "success" });
    closeMenu();
  }

  return (
    <>
      <IconButton
        color="inherit"
        sx={{ marginLeft: 1 }}
        onClick={openMenuOnClick}
      >
        <Icon>more_vert</Icon>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        sx={{ padding: 0 }}
        className="text-sm"
      >
        <li
          className={`
            px-4 py-2 flex items-center justify-content cursor-pointer
            ${!selected && "text-gray-400"}
          `}
          onClick={addToDeck}
        >
          Add to Deck
        </li>
      </Menu>
    </>
  );
}
