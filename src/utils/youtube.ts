export function parseVideoId(value: string): string | undefined {
  if (value.length === 11) {
    return value;
  }
  if (value.match(/youtube\.com|youtu\.be/)) {
    try {
      const url = new URL(value);
      if (url.hostname === "youtu.be") {
        return url.pathname.substring(1);
      } else {
        const match = url.search.match(/v=(.{11})/);
        if (match && match[1]) {
          return match[1];
        }
      }
    } catch {}
  }
  return;
}

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

// cf. https://github.com/ytdl-org/youtube-dl/blob/a7f61feab2dbfc50a7ebe8b0ea390bd0e5edf77a/youtube_dl/extractor/youtube.py#L283
const PLAYER_REPONSE_REGEX = /var ytInitialPlayerResponse = ({.+?});/;

export function parseVideoMetadata(html: string): VideoMetadata {
  const match = html.match(PLAYER_REPONSE_REGEX);
  if (match && match[1]) {
    return JSON.parse(match[1]);
  }
  throw new Error("PlayerResponse not found");
}
