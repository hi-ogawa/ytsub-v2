import * as React from "react";
import { useBookmarkEntries } from "../utils/storage";
import { BookmarkEntry } from "../utils/types";

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
        <div className="p-3 flex-none bg-gray-100">
          <span className="text-xl">Bookmarks</span>
        </div>
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

export function BookmarkEntryComponent({
  entry,
  onRemoveEntry,
}: {
  entry: BookmarkEntry;
  onRemoveEntry: React.Dispatch<BookmarkEntry>;
}) {
  return (
    <div
      className="
        border border-solid border-gray-200
        flex items-center
        p-2 gap-1
      "
    >
      <div className="grow text-sm">{entry.bookmarkText}</div>
      <span
        className="font-icon flex-none text-gray-500 cursor-pointer"
        onClick={() => onRemoveEntry(entry)}
      >
        close
      </span>
    </div>
  );
}
