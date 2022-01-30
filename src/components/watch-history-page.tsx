import { last } from "lodash";
import * as React from "react";
import type { Dispatch } from "react";
import { useHistoryEntries } from "../utils/storage";
import { HistoryEntry } from "../utils/types";
import { useNavigateCustom } from "../utils/url";

export function WatchHistoryPage() {
  const [entries, addEntry, removeEntry] = useHistoryEntries();
  const navigate = useNavigateCustom();

  function onPlayEntry(entry: HistoryEntry) {
    addEntry(entry);
    navigate("/watch", entry.watchParameters);
  }

  function onRemoveEntry(entry: HistoryEntry) {
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
        <div className="p-3 flex-none bg-gray-100">
          <span className="text-xl">History</span>
        </div>
        <div className="flex-[1_0_0] overflow-y-auto bg-white">
          <div className="flex flex-col p-2 gap-2">
            {entries.map((entry) => (
              <HistoryEntryComponent
                key={JSON.stringify(entry.watchParameters)}
                entry={entry}
                onPlayEntry={onPlayEntry}
                onRemoveEntry={onRemoveEntry}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryEntryComponent({
  entry,
  onPlayEntry,
  onRemoveEntry,
}: {
  entry: HistoryEntry;
  onPlayEntry: Dispatch<HistoryEntry>;
  onRemoveEntry?: Dispatch<HistoryEntry>;
}) {
  const { title, author, thumbnail } = entry.videoDetails;

  /*
    Layout

    <- 16 -> <--- 20 --->
    ↑        ↑
    9 (cover)|
    ↓        ↓
   */

  // TODO: Use <Link> instead of `onClick` event (https://github.com/hi-ogawa/ytsub-v2/issues/22)
  return (
    <div
      className="w-full flex border border-solid border-gray-200"
      style={{ aspectRatio: "36 / 9" }}
    >
      <div
        className="flex-none w-[44%] relative cursor-pointer"
        onClick={() => onPlayEntry(entry)}
      >
        <img className="absolute top-0" src={last(thumbnail.thumbnails)!.url} />
      </div>
      <div className="p-2 flex flex-col relative text-sm">
        <div
          className="line-clamp-2 mb-1 cursor-pointer"
          onClick={() => onPlayEntry(entry)}
        >
          {title}
        </div>
        <div className="w-11/12 line-clamp-1 text-gray-600 text-xs">
          {author}
        </div>
        {onRemoveEntry && (
          <div
            className="absolute right-1 bottom-1 cursor-pointer flex"
            onClick={() => onRemoveEntry(entry)}
          >
            <span className="font-icon">close</span>
          </div>
        )}
      </div>
    </div>
  );
}
