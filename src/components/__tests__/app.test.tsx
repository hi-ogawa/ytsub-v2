import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import * as React from "react";
import { Player } from "../app";

describe("Player", () => {
  it("works", () => {
    const videoId = "XrhqJmQnKAs";
    const result = render(<Player videoId={videoId} />);
    expect(result.baseElement.tagName).toBe("BODY");
  });
});
