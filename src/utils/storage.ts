import { useLocalStorage } from "@rehooks/local-storage";
import type { LocalStorageReturnValue } from "@rehooks/local-storage/lib/use-localstorage";
import { isEqual } from "lodash";
import type { LanguageSetting } from "./language";
import type { BookmarkEntry, HistoryEntry } from "./types";

const PREFIX = "ytsub-v2";

function toKey(name: string, version: string = "v1"): string {
  return PREFIX + "/" + name + "-" + version;
}

export function useLanguageSetting(): LocalStorageReturnValue<LanguageSetting> {
  return useLocalStorage<LanguageSetting>(toKey("language-setting"), {
    language1: undefined,
    language2: undefined,
  });
}

function isEqualHistoryEntry(e1: HistoryEntry, e2: HistoryEntry): boolean {
  return isEqual(e1.watchParameters, e2.watchParameters);
}

export function useHistoryEntries(): [
  entries: HistoryEntry[],
  add: (entry: HistoryEntry) => void,
  remove: (entry: HistoryEntry) => void
] {
  const [entries, setEntries] = useLocalStorage<HistoryEntry[]>(
    toKey("history-entries"),
    []
  );

  function filterOut(entry: HistoryEntry): HistoryEntry[] {
    return entries.filter((other) => !isEqualHistoryEntry(other, entry));
  }

  function add(entry: HistoryEntry) {
    setEntries([entry, ...filterOut(entry)]);
  }

  function remove(entry: HistoryEntry) {
    setEntries(filterOut(entry));
  }

  return [entries, add, remove];
}

export function useBookmarkEntries(): [
  entries: BookmarkEntry[],
  add: (entry: BookmarkEntry) => void,
  remove: (entry: BookmarkEntry) => void
] {
  const [entries, setEntries] = useLocalStorage<BookmarkEntry[]>(
    toKey("bookmark-entries"),
    []
  );

  function add(entry: BookmarkEntry) {
    setEntries([entry, ...entries]);
  }

  function remove(entry: BookmarkEntry) {
    setEntries(entries.filter((other) => other !== entry));
  }

  return [entries, add, remove];
}
