import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import * as React from "react";
import { PlayerComponent } from "../watch-page";

describe("PlayerComponent", () => {
  it("works", () => {
    const videoId = "XrhqJmQnKAs";
    const result = render(
      <PlayerComponent videoId={videoId} setPlayer={() => {}} />
    );
    expect(result.baseElement.tagName).toBe("BODY");
  });
});
