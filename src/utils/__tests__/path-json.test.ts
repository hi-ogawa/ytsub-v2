import { describe, expect, it } from "@jest/globals";
import fc from "fast-check";
import { fromPathJson, toPathJson } from "../path-json";

describe("path-json", () => {
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
      const pathJson = toPathJson(data);
      expect(pathJson).toMatchInlineSnapshot(`
        Array [
          Object {
            "keys": Array [
              "videoId",
            ],
            "primitive": "MoH8Fk2K9bc",
          },
          Object {
            "keys": Array [
              "captionConfigs",
              0,
              "id",
            ],
            "primitive": "a.fr",
          },
          Object {
            "keys": Array [
              "captionConfigs",
              1,
              "id",
            ],
            "primitive": "a.fr",
          },
          Object {
            "keys": Array [
              "captionConfigs",
              1,
              "translation",
            ],
            "primitive": "en",
          },
        ]
      `);
      expect(fromPathJson(pathJson)).toStrictEqual(data);
    });
  });

  describe("fuzz", () => {
    it("works", () => {
      fc.assert(
        fc.property(fc.jsonValue(), (data) =>
          expect(fromPathJson(toPathJson(data))).toStrictEqual(data)
        ),
        { verbose: true, numRuns: Number(process.env.FUZZ_NUM_RUNS) ?? 10 ** 3 }
      );
    });
  });
});
