import { describe, expect, it } from "@jest/globals";
import { fromFlatJson, toFlatJson } from "../flat-json";

describe("flat-json", () => {
  const from = {
    videoId: "MoH8Fk2K9bc",
    captionConfigs: [
      {
        id: "a.fr",
      },
      {
        id: "a.fr",
        translation: "en",
      },
    ],
  };

  const to = {
    "captionConfigs._0.id": "a.fr",
    "captionConfigs._1.id": "a.fr",
    "captionConfigs._1.translation": "en",
    videoId: "MoH8Fk2K9bc",
  };

  const query =
    "videoId=MoH8Fk2K9bc&captionConfigs._0.id=a.fr&captionConfigs._1.id=a.fr&captionConfigs._1.translation=en";

  describe("toFlatJson", () => {
    it("works(record)", () => {
      expect(toFlatJson(from)).toStrictEqual(to);
    });

    it("works(query)", () => {
      expect(new URLSearchParams(toFlatJson(from)).toString()).toBe(query);
    });
  });

  describe("fromFlatJson", () => {
    it("works", () => {
      expect(fromFlatJson(to)).toStrictEqual(from);
    });
  });
});
