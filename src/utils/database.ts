import sqljs from "sql.js";
import type { Database } from "sql.js";

// TODO:
// - use comlink to provide non-blocking api

function locateFile(): any {
  // Node (jest)
  // @ts-ignore
  if (typeof __webpack_require__ === "undefined") {
    return "node_modules/sql.js/dist/sql-wasm.wasm";
  }
  // Browser (webpack)
  // @ts-ignore
  return require("!!file-loader!sql.js/dist/sql-wasm.wasm").default;
}

// Uint8Array can be directly saved to IndexedDB on browser
export async function open(data?: Uint8Array): Promise<Database> {
  const SQL = await sqljs({ locateFile });
  return new SQL.Database(data);
}
