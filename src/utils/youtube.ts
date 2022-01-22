import { sprintf } from "sprintf-js";
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
  const { vssId, translationLanguageCode } = captionConfig;
  const { captionTracks } =
    videoMetadata.captions.playerCaptionsTracklistRenderer;
  const track = captionTracks.find((track) => track.vssId === vssId);
  if (track) {
    let url = track.baseUrl + "&fmt=ttml";
    if (translationLanguageCode) {
      url += "&" + translationLanguageCode;
    }
    return url;
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

// TODO: parseTimestamp
// TODO: stringifyTimestamp

// e.g. 00:02:04.020 => 2 * 60 + 4.02 = 124.02
export function parseTimestamp(text: string): number {
  const [h, m, s] = text.split(":").map(Number);
  return (h * 60 + m) * 60 + s;
}

// e.g. 124.02 => 00:02:04.02
export function stringifyTimestamp(s: number): string {
  let ms = (s * 1000) % 1000;
  let m = Math.floor(s / 60);
  s = s % 60;
  let h = Math.floor(m / 60);
  m = m % 60;
  return sprintf("%02d:%02d:%02d.%03d", h, m, s, ms);
}
