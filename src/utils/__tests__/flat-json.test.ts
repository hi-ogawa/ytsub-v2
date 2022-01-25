import { describe, expect, it } from "@jest/globals";
import fc from "fast-check";
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

  describe("edge-cases", () => {
    it("case 0", () => {
      const x = {};
      const y = "_{}";
      expect(toFlatJson(x)).toStrictEqual(y);
      expect(fromFlatJson(y)).toStrictEqual(x);
    });

    it("case 1", () => {
      const x = { "": { ".": 0 } };
      const y = { ".\\.": "_0" };
      expect(toFlatJson(x)).toStrictEqual(y);
      expect(fromFlatJson(y)).toStrictEqual(x);
    });

    // TODO: fix
    it.skip("case 2", () => {
      const x = {
        "": {
          "\\_": false,
        },
      };
      const y = { ".\\\\_": "_false" };
      expect(toFlatJson(x)).toStrictEqual(y);
      expect(fromFlatJson(y)).toStrictEqual(x);
    });
  });
});

function describeExplicit(blockName: string, blockFn: () => void): void {
  (process.env.DESCRIBE === blockName ? describe : describe.skip)(
    blockName,
    blockFn
  );
}

// DESCRIBE=flat-json-fuzz npm run test -- -t flat-json-fuzz
describeExplicit("flat-json-fuzz", () => {
  describe("fromFlatJson(toFlatJson(...))", () => {
    it("works", () => {
      fc.assert(
        fc.property(fc.jsonValue(), (data) => {
          expect(fromFlatJson(toFlatJson(data))).toStrictEqual(data);
        }),
        { verbose: true }
      );
    });
  });
});
