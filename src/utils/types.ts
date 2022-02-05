import { Static, Type as t } from "@sinclair/typebox";

export const CaptionConfigSchema = t.Object({
  // e.g. ".en", ".fr", (manual caption) "a.fr" (auto caption)
  id: t.String(),
  // e.g. "en", "fr"
  translation: t.Optional(t.String()),
});
export type CaptionConfig = Static<typeof CaptionConfigSchema>;

export const WatchParametersSchema = t.Object({
  videoId: t.String(),
  captions: t.Tuple([CaptionConfigSchema, CaptionConfigSchema]),
});
export type WatchParameters = Static<typeof WatchParametersSchema>;

export interface VideoDetails {
  videoId: string;
  title: string;
  author: string;
  channelId: string;
  // TODO: Might be better to hard code "https://i.ytimg.com/vi/URQMSN1sbq8/hqdefault.jpg" and avoid using "maxresdefault.jpg"
  thumbnail: {
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
  };
}

// aka. youtube player response
export type VideoMetadata = {
  playabilityStatus: {
    status: "OK" | "ERROR";
  };
  videoDetails: VideoDetails;
  captions: {
    playerCaptionsTracklistRenderer: {
      captionTracks: {
        baseUrl: string;
        vssId: string;
        languageCode: string;
        kind?: string;
      }[];
    };
  };
};

export function stripVideoMetadata(x: VideoMetadata): VideoMetadata {
  return {
    playabilityStatus: { status: x.playabilityStatus.status },
    videoDetails: x.videoDetails,
    captions: {
      playerCaptionsTracklistRenderer: {
        captionTracks: x.captions.playerCaptionsTracklistRenderer.captionTracks,
      },
    },
  };
}

export interface CaptionEntry {
  begin: number;
  end: number;
  text1: string;
  text2: string;
}

export interface HistoryEntry {
  watchParameters: WatchParameters;
  videoDetails: VideoDetails;
}

export interface BookmarkEntry {
  watchParameters: WatchParameters;
  captionEntry: CaptionEntry;
  bookmarkText: string;
}

export interface DemoEntry {
  watchParameters: WatchParameters;
  videoMetadata: VideoMetadata;
  captionEntries: CaptionEntry[];
}
