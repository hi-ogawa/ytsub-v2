import { describe, expect, it } from "@jest/globals";
import { Rng, hash32 } from "../rng";

describe("rng/hash32", () => {
  describe("basic", () => {
    it("works", () => {
      expect(hash32(0)).toMatchInlineSnapshot(`0`);
      expect(hash32(1234)).toMatchInlineSnapshot(`1074557550`);
      expect(hash32(12345678)).toMatchInlineSnapshot(`1215340986`);
    });
  });

  describe("uniformity", () => {
    it("works", () => {
      const bins = Array(20).fill(0);
      for (let i = 0; i < 10 ** 4; i++) {
        const j = Math.floor((hash32(i) / 2 ** 32) * bins.length);
        bins[j]++;
      }
      expect(bins).toMatchInlineSnapshot(`
        Array [
          542,
          504,
          520,
          509,
          543,
          479,
          469,
          495,
          530,
          497,
          510,
          466,
          502,
          466,
          494,
          483,
          505,
          499,
          479,
          508,
        ]
      `);
    });
  });
});

describe("rng/Rng", () => {
  describe("basic", () => {
    it("case 1", () => {
      const rng = new Rng();
      expect(rng.id(1644113287949)).toMatchInlineSnapshot(
        `"0xd9608e3a68caf31d"`
      );
      expect(rng.id(1644113290872)).toMatchInlineSnapshot(
        `"0x668e29a2d9d78eb8"`
      );
      expect(rng.id(1644113291763)).toMatchInlineSnapshot(
        `"0x304611b0b68bda85"`
      );
    });
  });
});
