import * as fs from "fs/promises";
import { pick } from "lodash";
import * as yargs from "yargs";
import * as assert from "../utils/assert";
import { DemoEntry, WatchParameters } from "../utils/types";
import {
  captionConfigToUrl,
  parseVideoMetadata,
  ttmlsToCaptionEntries,
} from "../utils/youtube";
import { injectGlobal } from "./jsdom";

async function generateDemoEntry(
  watchParameters: WatchParameters
): Promise<DemoEntry> {
  const { videoId, captions } = watchParameters;

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.error(`:: fetching html '${url}'...`);
  const res = await fetch(url, {
    headers: { "accept-language": "en-US,en" },
  });
  assert.ok(res.ok);

  console.error(":: parsing video metadata...");
  const resText = await res.text();
  const videoMetadata = parseVideoMetadata(resText);
  assert.ok(videoMetadata.playabilityStatus.status === "OK");

  console.error(":: fetching ttml files...");
  const ttmlUrl1 = captionConfigToUrl(captions[0], videoMetadata);
  const ttmlUrl2 = captionConfigToUrl(captions[1], videoMetadata);
  assert.ok(ttmlUrl1);
  assert.ok(ttmlUrl2);
  const [res1, res2] = await Promise.all([fetch(ttmlUrl1), fetch(ttmlUrl2)]);
  assert.ok(res1.ok);
  assert.ok(res2.ok);
  const ttml1 = await res1.text();
  const ttml2 = await res2.text();
  const captionEntries = ttmlsToCaptionEntries(ttml1, ttml2);

  return {
    watchParameters,
    videoMetadata: pick(videoMetadata, [
      "playabilityStatus",
      "videoDetails",
      "captions",
    ]),
    captionEntries,
  };
}

async function mainGenerateDemoEntry() {
  const watchParameters = await fs.readFile("/dev/stdin", "utf-8");
  const demoEntry = await generateDemoEntry(JSON.parse(watchParameters));
  console.log(JSON.stringify(demoEntry, null, 2));
}

function mainCli() {
  yargs
    .command({
      command: "generate-demo-entry",
      handler: mainGenerateDemoEntry,
    })
    .demandCommand()
    .help().argv;
}

if (require.main === module) {
  injectGlobal("DOMParser", "fetch");
  mainCli();
}
