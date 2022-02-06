import { useLocalStorage } from "@rehooks/local-storage";
import type { LocalStorageReturnValue } from "@rehooks/local-storage/lib/use-localstorage";
import type { LanguageSetting } from "./language";
import { PracticeSystem } from "./practice";
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

export function useHistoryEntries(): [
  entries: HistoryEntry[],
  add: (entry: HistoryEntry) => void,
  remove: (entry: HistoryEntry) => void,
  set: (entries: HistoryEntry[]) => void
] {
  const [entries, setEntries] = useLocalStorage<HistoryEntry[]>(
    toKey("history-entries"),
    []
  );

  function filterOut(entry: HistoryEntry): HistoryEntry[] {
    return entries.filter(
      (other) => other.watchParameters.videoId !== entry.watchParameters.videoId
    );
  }

  function add(entry: HistoryEntry) {
    setEntries([entry, ...filterOut(entry)]);
  }

  function remove(entry: HistoryEntry) {
    setEntries(filterOut(entry));
  }

  return [entries, add, remove, setEntries];
}

export function useBookmarkEntries(): [
  entries: BookmarkEntry[],
  add: (entry: BookmarkEntry) => void,
  remove: (entry: BookmarkEntry) => void,
  set: (entries: BookmarkEntry[]) => void
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

  return [entries, add, remove, setEntries];
}

export function usePracticeSystem(): [
  practiceSystem: PracticeSystem,
  setPracticeSystem: (system: PracticeSystem) => void
] {
  const [serialized, setSerialized] = useLocalStorage<any>(
    toKey("practice-system"),
    new PracticeSystem().serialize()
  );
  return [
    PracticeSystem.deserialize(serialized),
    (practiceSystem: PracticeSystem) =>
      setSerialized(practiceSystem.serialize()),
  ];
}
