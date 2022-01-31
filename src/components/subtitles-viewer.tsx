import Paper from "@mui/material/Paper";
import classnames from "classnames";
import * as React from "react";
import { CaptionEntry } from "../utils/types";
import { PlayerState, stringifyTimestamp } from "../utils/youtube";
import { BOOKMARKABLE_CLASSNAME } from "./misc";

export function SubtitlesViewer({
  captionEntries,
  currentEntry,
  repeatingEntries,
  onClickEntryPlay,
  onClickEntryRepeat,
  playerState,
}: {
  captionEntries: CaptionEntry[];
  currentEntry: CaptionEntry | undefined;
  repeatingEntries: CaptionEntry[];
  onClickEntryPlay: (entry: CaptionEntry, toggle: boolean) => void;
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
          isCurrentEntry={currentEntry === e}
          isRepeating={repeatingEntries.includes(e)}
          onClickEntryPlay={onClickEntryPlay}
          onClickEntryRepeat={onClickEntryRepeat}
          playerState={playerState}
        />
      ))}
    </Paper>
  );
}

export function CaptionEntryComponent({
  entry,
  isCurrentEntry,
  isRepeating,
  onClickEntryPlay,
  onClickEntryRepeat,
  onClickEntrySearch,
  playerState,
  border = true,
}: {
  entry: CaptionEntry;
  isCurrentEntry: boolean;
  isRepeating: boolean;
  onClickEntryPlay: (entry: CaptionEntry, toggle: boolean) => void;
  onClickEntryRepeat: (entry: CaptionEntry) => void;
  onClickEntrySearch?: (entry: CaptionEntry) => void;
  playerState: PlayerState;
  border?: boolean;
}) {
  const { begin, end, text1, text2 } = entry;
  const timestamp = [begin, end].map(stringifyTimestamp).join(" - ");
  const { isPlaying } = playerState;
  const isCurrentEntryPlaying = isCurrentEntry && isPlaying;

  return (
    <div
      className={classnames(
        `
        flex flex-col
        ${border && "border border-solid border-gray-200"}
        ${isCurrentEntryPlaying ? "border-blue-400" : "border-gray-200"}
        ${isCurrentEntry && "bg-gray-100"}
        p-2
        text-sm
      `
      )}
    >
      <div
        className="
          flex items-center justify-end
          gap-2
          pr-1
          text-gray-500
          text-xs
        "
      >
        <div>{timestamp}</div>
        {onClickEntrySearch && (
          <span
            className="font-icon text-base leading-5 cursor-pointer"
            onClick={() => onClickEntrySearch(entry)}
          >
            search
          </span>
        )}
        {onClickEntryRepeat && (
          <span
            className={`font-icon text-base leading-5 cursor-pointer ${
              isRepeating && "text-blue-600"
            }`}
            onClick={() => onClickEntryRepeat(entry)}
          >
            repeat
          </span>
        )}
        <span
          className={`font-icon text-base leading-5 cursor-pointer ${
            isCurrentEntryPlaying && "text-blue-600"
          }`}
          onClick={() => onClickEntryPlay(entry, false)}
        >
          play_circle_outline
        </span>
      </div>
      <div
        className="flex text-gray-700 cursor-pointer"
        onClick={() => onClickEntryPlay(entry, true)}
      >
        <div
          className={classnames(
            `
            flex-auto w-1/2
            pr-2
            border-r border-solid border-gray-200
          `,
            BOOKMARKABLE_CLASSNAME
          )}
        >
          {text1}
        </div>
        <div
          className={classnames("flex-auto w-1/2 pl-2", BOOKMARKABLE_CLASSNAME)}
        >
          {text2}
        </div>
      </div>
    </div>
  );
}

function toCaptionEntryId({ begin, end }: CaptionEntry): string {
  return `${begin}--${end}`;
}
