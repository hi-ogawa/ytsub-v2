import * as React from "react";
import * as assert from "../utils/assert";
import { useBookmarkEntries } from "../utils/storage";
import { BookmarkEntry } from "../utils/types";
import { BookmarkEntryComponent } from "./bookmark-list-page";

// TODO: implement spaced repetition system

class Rng {
  static uniform(): number {
    return Math.random();
  }

  static choice<T>(ls: T[]): T {
    const i = Math.floor(ls.length * Rng.uniform());
    assert.ok(i < ls.length);
    return ls[i];
  }
}

type PracticeEntry = BookmarkEntry;
const PracticeEntryComponent = BookmarkEntryComponent;

export function PracticePage() {
  const [entries] = useBookmarkEntries();
  const entry: PracticeEntry | undefined =
    entries.length > 0 ? Rng.choice(entries) : undefined;

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
        {entry ? <PracticeEntryComponent entry={entry} /> : "No practice entry"}
      </div>
    </div>
  );
}
