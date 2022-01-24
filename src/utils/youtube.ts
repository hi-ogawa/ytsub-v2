import { sprintf } from "sprintf-js";
import { LanguageCode } from "./language";
import { CaptionConfig, CaptionEntry, VideoMetadata } from "./types";

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

// cf. https://github.com/ytdl-org/youtube-dl/blob/a7f61feab2dbfc50a7ebe8b0ea390bd0e5edf77a/youtube_dl/extractor/youtube.py#L283
const PLAYER_REPONSE_REGEX = /var ytInitialPlayerResponse = ({.+?});/;

export function parseVideoMetadata(html: string): VideoMetadata {
  const match = html.match(PLAYER_REPONSE_REGEX);
  if (match && match[1]) {
    return JSON.parse(match[1]);
  }
  throw new Error("PlayerResponse not found");
}

export function captionConfigToUrl(
  captionConfig: CaptionConfig,
  videoMetadata: VideoMetadata
): string | undefined {
  const { id: vssId, translation } = captionConfig;
  const { captionTracks } =
    videoMetadata.captions.playerCaptionsTracklistRenderer;
  const track = captionTracks.find((track) => track.vssId === vssId);
  if (track) {
    let url = track.baseUrl + "&fmt=ttml";
    if (translation) {
      url += "&tlang=" + translation;
    }
    return url;
  }
  return;
}

export function findCaptionConfig(
  videoMetadata: VideoMetadata,
  code: LanguageCode
): CaptionConfig | undefined {
  const { captionTracks } =
    videoMetadata.captions.playerCaptionsTracklistRenderer;

  // Manual caption
  let manual = captionTracks.find(({ vssId }) => vssId.startsWith("." + code));
  if (manual) {
    return { id: manual.vssId };
  }

  // Machine speech recognition capion
  let machine = captionTracks.find(({ vssId }) =>
    vssId.startsWith("a." + code)
  );
  if (machine) {
    return { id: machine.vssId };
  }

  return;
}

export function ttmlToEntries(
  ttml: string
): { begin: number; end: number; text: string }[] {
  const doc = new DOMParser().parseFromString(ttml, "text/xml");
  // Remove "<br/>" elements
  doc.querySelectorAll("br").forEach((br) => {
    br.replaceWith(" ");
  });
  return Array.from(doc.querySelectorAll("p")).map((p) => ({
    begin: parseTimestamp(p.getAttribute("begin")!),
    end: parseTimestamp(p.getAttribute("end")!),
    text: p.textContent!,
  }));
}

export function ttmlsToCaptionEntries(
  ttml1: string,
  ttml2: string
): CaptionEntry[] {
  const entries1 = ttmlToEntries(ttml1);
  const entries2 = ttmlToEntries(ttml2);
  return entries1.map(({ begin, end, text }) => {
    const e2 = entries2.find((e2) => e2.begin === begin);
    return {
      begin,
      end,
      text1: text,
      text2: e2?.text ?? "",
    };
  });
}

export function parseTimestamp(text: string): number {
  const [h, m, s] = text.split(":").map(Number);
  return (h * 60 + m) * 60 + s;
}

export function stringifyTimestamp(s: number): string {
  let ms = (s * 1000) % 1000;
  let m = Math.floor(s / 60);
  s = s % 60;
  let h = Math.floor(m / 60);
  m = m % 60;
  return sprintf("%02d:%02d:%02d.%03d", h, m, s, ms);
}

//
// https://developers.google.com/youtube/iframe_api_reference
//

type YoutubeApi = any;
type YoutubePlayer = any;

export type PlayerState = {
  currentTime: number;
  isPlaying: boolean;
};

export const DEFAULT_PLAYER_STATE: PlayerState = {
  currentTime: 0,
  isPlaying: false,
};

type PlayerOptions = {
  videoId: string;
  height?: number;
  width?: number;
  playerVars?: {
    autoplay?: 0 | 1;
    start?: number; // must be integer
  };
};

export class Player {
  // TODO: cleanup
  static async create(
    element: HTMLElement,
    options: PlayerOptions
  ): Promise<Player> {
    const api = await loadYoutubeApi();
    return new Promise((resolve) => {
      const onReady = (event: any) => {
        resolve(new Player(event.target));
      };
      const newOptions = { ...options, events: { onReady } };
      new api.Player(element, newOptions);
    });
  }

  constructor(private internal: YoutubePlayer) {}

  destroy() {
    this.internal.destroy();
  }

  seekTo(time: number) {
    this.internal.seekTo(time);
  }

  pauseVideo() {
    this.internal.pauseVideo();
  }

  playVideo() {
    this.internal.playVideo();
  }

  cueVideoById(videoId: string) {
    this.internal.cueVideoById(videoId);
  }

  getState(): PlayerState {
    return {
      currentTime: this.internal.getCurrentTime(),
      isPlaying: this.internal.getPlayerState() == 1,
    };
  }
}

let youtubeApiPromise: Promise<YoutubeApi> | undefined = undefined;

export async function loadYoutubeApi(): Promise<YoutubeApi> {
  if (typeof youtubeApiPromise === "undefined") {
    youtubeApiPromise = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.type = "text/javascript";
      el.async = true;
      el.src = "https://www.youtube.com/iframe_api";
      el.addEventListener("load", () => {
        const youtubeApi = (window as any).YT;
        youtubeApi.ready(() => resolve(youtubeApi));
      });
      el.addEventListener("error", (error) => {
        console.error(error);
        reject(new Error());
      });
      document.body.appendChild(el);
    });
  }
  return youtubeApiPromise;
}
