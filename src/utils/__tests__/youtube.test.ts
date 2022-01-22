import { beforeAll, describe, expect, it } from "@jest/globals";
import * as fs from "fs/promises";
import {
  parseTimestamp,
  parseVideoId,
  stringifyTimestamp,
  ttmlsToCaptionEntries,
} from "../youtube";

describe("parseVideoId", () => {
  it("works", () => {
    const input = "https://www.youtube.com/watch?v=XrhqJmQnKAs";
    expect(parseVideoId(input)).toBe("XrhqJmQnKAs");
  });
});

describe("parseTimestamp", () => {
  it("works", () => {
    expect(parseTimestamp("00:02:04.020")).toBe(124.02);
  });
});

describe("stringifyTimestamp", () => {
  it("works", () => {
    expect(stringifyTimestamp(124.02)).toBe("00:02:04.020");
  });
});

describe("ttmlsToCaptionEntries", () => {
  let ttml1: string;
  let ttml2: string;

  beforeAll(async () => {
    ttml1 = await fs.readFile("misc/youtube/examples/MoH8Fk2K9bc-en.ttml", {
      encoding: "utf8",
    });
    ttml2 = await fs.readFile("misc/youtube/examples/MoH8Fk2K9bc-fr-FR.ttml", {
      encoding: "utf8",
    });
  });

  it("works", () => {
    const captionEntries = ttmlsToCaptionEntries(ttml1, ttml2);
    expect(captionEntries.length).toBe(63);
    expect(captionEntries[0]).toStrictEqual({
      begin: 5.28,
      end: 7.65,
      text1: "Welcome to this video where we",
      text2: "Bienvenue dans ce format de vidéo où nous",
    });
  });
});
