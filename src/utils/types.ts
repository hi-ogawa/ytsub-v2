export interface CaptionConfig {
  // e.g. ".en", ".fr", (manual caption) "a.fr" (auto caption)
  id: string;
  // e.g. "en", "fr"
  translation?: string;
}

export interface WatchParameters {
  videoId: string;
  captions: [CaptionConfig, CaptionConfig];
}

export interface VideoDetails {
  videoId: string;
  title: string;
  author: string;
  channelId: string;
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

export interface PlayerSettings {
  autoScroll: boolean;
}

export interface DemoEntry {
  watchParameters: WatchParameters;
  videoMetadata: VideoMetadata;
  captionEntries: CaptionEntry[];
}
