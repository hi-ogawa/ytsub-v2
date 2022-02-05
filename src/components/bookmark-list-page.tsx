import * as React from "react";
import * as assert from "../utils/assert";
import { useBookmarkEntries } from "../utils/storage";
import { BookmarkEntry, CaptionEntry } from "../utils/types";
import { useNavigateCustom } from "../utils/url";
import { DEFAULT_PLAYER_STATE, Player } from "../utils/youtube";
import { PLAYER_STATE_SYNC_INTERVAL } from "./misc";
import { CaptionEntryComponent } from "./subtitles-viewer";

export function BookmarkListPage() {
  const [entries, _, removeEntry] = useBookmarkEntries();

  function onRemoveEntry(entry: BookmarkEntry) {
    removeEntry(entry);
  }

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
        <div className="flex-[1_0_0] overflow-y-auto bg-white">
          <div className="flex flex-col p-2 gap-2">
            {entries.map((entry) => (
              <BookmarkEntryComponent
                key={entry.bookmarkText}
                entry={entry}
                onRemoveEntry={onRemoveEntry}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookmarkEntryComponent({
  entry,
  onRemoveEntry,
}: {
  entry: BookmarkEntry;
  onRemoveEntry: React.Dispatch<BookmarkEntry>;
}) {
  const [open, setOpen] = React.useState(false);

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
        <span
          className="font-icon flex-none text-gray-500 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {open ? "expand_less" : "expand_more"}
        </span>
        <div
          className="grow text-sm cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {entry.bookmarkText}
        </div>
        <span
          className="font-icon flex-none text-gray-500 cursor-pointer"
          onClick={() => onRemoveEntry(entry)}
        >
          close
        </span>
      </div>
      {open && <MiniPlayer entry={entry} />}
    </div>
  );
}

// TODO: refactor with WatchPageOk
function MiniPlayer({ entry }: { entry: BookmarkEntry }) {
  const navigate = useNavigateCustom();
  const [player, setPlayer] = React.useState<Player>();
  const [playerState, setPlayerState] = React.useState(DEFAULT_PLAYER_STATE);
  const [isRepeating, setIsRepeating] = React.useState(false);

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
