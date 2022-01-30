import { concat, isEqual } from "lodash";
import { LanguageCode } from "./language";
import { DemoEntry, WatchParameters } from "./types";

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
