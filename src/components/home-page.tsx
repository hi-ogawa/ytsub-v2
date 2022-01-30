import * as React from "react";
import { LANGUAGE_TO_DEMO_ENTRIES } from "../utils/demo-entries";
import { languageCodeToName } from "../utils/language";
import { entries as getEntries } from "../utils/lodash-extra";
import { HistoryEntry } from "../utils/types";
import { useNavigateCustom } from "../utils/url";
import { HistoryEntryComponent } from "./watch-history-page";

export function HomePage() {
  const navigate = useNavigateCustom();

  function onPlayEntry(entry: HistoryEntry) {
    navigate(`/setup/${entry.watchParameters.videoId}`, entry.watchParameters);
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
          <div className="text-xl">Examples</div>
        </div>
        <div className="flex-[1_0_0] overflow-y-auto bg-white">
          <div className="flex flex-col p-2 gap-2">
            {getEntries(LANGUAGE_TO_DEMO_ENTRIES).map(
              ([language, entries], index) => (
                <React.Fragment key={language}>
                  <div
                    className={`
                      text-gray-500 text-lg
                      m-2 mb-0
                      ${index == 0 && "mt-0"}
                    `}
                  >
                    {languageCodeToName(language)}
                  </div>
                  {entries!.map((entry) => (
                    <HistoryEntryComponent
                      key={entry.watchParameters.videoId}
                      entry={{ ...entry, ...entry.videoMetadata }}
                      onPlayEntry={onPlayEntry}
                    />
                  ))}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
