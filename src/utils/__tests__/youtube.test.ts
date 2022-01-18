import { describe, expect, it } from "@jest/globals";
import { parseVideoId } from "../youtube";

describe("parseVideoId", () => {
  it("works", () => {
    const input = "https://www.youtube.com/watch?v=XrhqJmQnKAs";
    expect(parseVideoId(input)).toBe("XrhqJmQnKAs");
  });
});
