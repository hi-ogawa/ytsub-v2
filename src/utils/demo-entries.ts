import { concat, isEqual } from "lodash";
import { LanguageCode } from "./language";
import {
  BookmarkEntry,
  DemoEntry,
  HistoryEntry,
  WatchParameters,
} from "./types";

export const LANGUAGE_TO_DEMO_ENTRIES: Partial<
  Record<LanguageCode, DemoEntry[]>
> = require("../../misc/youtube/demo");

export const DEMO_ENTRIES: DemoEntry[] = concat(
  ...Object.values(LANGUAGE_TO_DEMO_ENTRIES)
);

export function findDemoEntry(
  watchParameters: WatchParameters
): DemoEntry | undefined {
  return DEMO_ENTRIES.find((entry) =>
    isEqual(entry.watchParameters, watchParameters)
  );
}

export interface Dump {
  historyEntries: HistoryEntry[];
  bookmarkEntries: BookmarkEntry[];
  practiceSystem: any;
}

export const DUMP: Dump = require("../../misc/dump/2022-02-06.json");
