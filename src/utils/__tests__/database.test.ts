import { describe, expect, it } from "@jest/globals";
import { open } from "../database";

describe("database", () => {
  describe("basic", () => {
    it("works", async () => {
      const db = await open();
      const query = "SELECT 1 + :x";
      {
        const result = db.exec(query, { ":x": 2 });
        expect(result[0].values).toEqual([[3]]);
      }
      {
        const result = db.exec(query, { ":x": 3 });
        expect(result[0].values).toEqual([[4]]);
      }
    });
  });
});
