import { describe, it, expect } from "@jest/globals";
import * as React from "react";
import { render } from "@testing-library/react";
import { Player } from "../app";

describe("Player", () => {
  it("works", () => {
    const videoId = "XrhqJmQnKAs";
    const result = render(<Player videoId={videoId} />);
    expect(result.baseElement.tagName).toBe("BODY");
  });
});
