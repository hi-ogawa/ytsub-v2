// cf. https://github.com/rstacruz/jsdom-global/blob/master/index.js

import * as jsdom from "jsdom";

const HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
  </body>
</html>
`;

function createWindow() {
  const { window } = new jsdom.JSDOM(HTML);
  return window;
}

export function injectGlobal(...keys: (keyof jsdom.DOMWindow)[]) {
  const window = createWindow();
  for (const key of keys) {
    (global as any)[key] =
      key === "fetch" ? require("node-fetch") : window[key];
  }
}
