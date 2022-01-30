import { describe, expect, it } from "@jest/globals";
import {
  fromJsonSearchParams,
  toJsonSearchParams,
} from "../json-search-params";

describe("json-search-params", () => {
  describe("simple", () => {
    const data = {
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

    it("works", () => {
      const params = toJsonSearchParams(data);
      expect(fromJsonSearchParams(params)).toMatchInlineSnapshot(`
        Object {
          "captionConfigs": Array [
            Object {
              "id": "a.fr",
            },
            Object {
              "id": "a.fr",
              "translation": "en",
            },
          ],
          "videoId": "MoH8Fk2K9bc",
        }
      `);
      expect(params.toString()).toMatchInlineSnapshot(
        `"videoId=MoH8Fk2K9bc&captionConfigs.0.id=a.fr&captionConfigs.1.id=a.fr&captionConfigs.1.translation=en"`
      );
    });
  });
});
