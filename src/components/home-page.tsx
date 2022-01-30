import * as React from "react";
import { LanguageCode, languageCodeToName } from "../utils/language";
import { entries as getEntries } from "../utils/lodash-extra";
import { CaptionEntry, HistoryEntry, VideoMetadata } from "../utils/types";
import { useNavigateCustom } from "../utils/url";
import { HistoryEntryComponent } from "./watch-history-page";

type ExampleEntry = {
  historyEntry: HistoryEntry;
  // TODO: Cache necessary data for quick demo and development
  videoMetadata?: VideoMetadata;
  captionEntries?: CaptionEntry[];
};

const LANGUAGE_TO_EXAMPLE_ENTRIES: Partial<
  Record<LanguageCode, ExampleEntry[]>
> = {
  fr: [
    {
      historyEntry: {
        watchParameters: {
          videoId: "XrhqJmQnKAs",
          captions: [{ id: ".fr" }, { id: ".en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/XrhqJmQnKAs.json"),
      },
    },
    {
      historyEntry: {
        watchParameters: {
          videoId: "MoH8Fk2K9bc",
          captions: [{ id: ".fr-FR" }, { id: ".en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/MoH8Fk2K9bc.json"),
      },
    },
    {
      historyEntry: {
        watchParameters: {
          videoId: "EnPYXckiUVg",
          captions: [{ id: ".fr" }, { id: ".en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/EnPYXckiUVg.json"),
      },
    },
    {
      historyEntry: {
        watchParameters: {
          videoId: "vCb8iA4SjOI",
          captions: [{ id: "a.fr" }, { id: "a.fr", translation: "en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/vCb8iA4SjOI.json"),
      },
    },
  ],
  ru: [
    {
      historyEntry: {
        watchParameters: {
          videoId: "GZ2uc-3pQbA",
          captions: [{ id: ".ru" }, { id: ".ru", translation: "en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/GZ2uc-3pQbA.json"),
      },
    },
    {
      historyEntry: {
        watchParameters: {
          videoId: "FSYe9GQc9Ow",
          captions: [{ id: "a.ru" }, { id: "a.ru", translation: "en" }],
        },
        videoDetails: require("../../misc/youtube/video-details/FSYe9GQc9Ow.json"),
      },
    },
  ],
};

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
            {getEntries(LANGUAGE_TO_EXAMPLE_ENTRIES).map(
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
                      key={entry.historyEntry.watchParameters.videoId}
                      entry={entry.historyEntry}
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
