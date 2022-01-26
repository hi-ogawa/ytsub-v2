import { describe, expect, it } from "@jest/globals";
import fc from "fast-check";
import { fromFlatJson, toFlatJson } from "../flat-json";
import { describeOnlyEnv, NormalizeZeroVisitor } from "./helpers";

describe("flat-json-simple", () => {
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

  describe("edge-cases", () => {
    interface Example {
      x: any;
      y: string | Record<string, string>;
      toFail?: true;
      fromFail?: true;
    }

    const EXAMPLES: Example[] = [
      {
        x: {},
        y: "_{}",
      },
      {
        x: { "": { ".": 0 } },
        y: { ".\\.": "_0" },
      },
      {
        x: {
          "": {
            "\\_": false,
          },
        },
        y: { ".\\\\\\_": "_false" },
      },
      {
        x: [{ "..": "" }],
        y: { "_0.\\.\\.": "" },
      },
      {
        x: { "": { "\\.": false } },
        y: { ".\\\\\\.": "_false" },
      },
      {
        x: { "\\": [0] },
        y: { "\\\\._0": "_0" },
      },
      {
        x: "\\_",
        y: "\\\\\\_",
      },
      {
        x: -0,
        y: "_0",
        fromFail: true,
      },
    ];

    function xfail(condition: boolean, e: any): any {
      return condition ? e.not : e;
    }

    EXAMPLES.forEach(({ x, y, toFail = false, fromFail = false }, i) => {
      it(`toFlatJson(${i})`, () => {
        xfail(toFail, expect(toFlatJson(x))).toStrictEqual(y);
      });
      it(`fromFlatJson(${i})`, () => {
        xfail(fromFail, expect(fromFlatJson(y))).toStrictEqual(x);
      });
    });
  });
});

// DESCRIBE=flat-json-fuzz npm run test
describeOnlyEnv("flat-json-fuzz", () => {
  describe("fromFlatJson(toFlatJson(...))", () => {
    const normalizeZero = new NormalizeZeroVisitor(); // Exclude `-0`
    it("works", () => {
      fc.assert(
        fc.property(
          fc.jsonValue().map((data) => normalizeZero.visit(data)),
          (data) => {
            expect(fromFlatJson(toFlatJson(data))).toStrictEqual(data);
          }
        ),
        { verbose: true, numRuns: 10 ** 4 }
      );
    });
  });
});
