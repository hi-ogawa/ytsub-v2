export interface CaptionConfig {
  // e.g. ".en", ".fr", (manual caption) "a.fr" (auto caption)
  vssId: string;
  // e.g. "en", "fr"
  translation?: string;
}

export interface WatchParameters {
  videoId: string;
  captionConfig1: CaptionConfig;
  captionConfig2: CaptionConfig;
}

// aka. youtube player response
export type VideoMetadata = {
  playabilityStatus: {
    status: "OK" | "ERROR";
  };
  videoDetails: {
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
  };
  captions: {
    playerCaptionsTracklistRenderer: {
      captionTracks: {
        baseUrl: string;
        vssId: string;
        languageCode: string;
        kind?: string;
      }[];
      translationLanguages: {
        languageCode: string;
      }[];
    };
  };
};

export interface CaptionEntry {
  begin: number;
  end: number;
  text1: string;
  text2: string;
}
