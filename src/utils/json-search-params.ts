import * as assert from "./assert";

export function toJsonSearchParams(data: any): URLSearchParams {
  return new URLSearchParams(encodeJsonParams(toJsonParams(data)));
}

export function fromJsonSearchParams(params: URLSearchParams): any {
  return fromJsonParams(
    decodeJsonParams(Array.from((params as any).entries()))
  );
}

type Primitive = string;
type Key = string | number;
type JsonParams = [keys: Key[], value: Primitive][];
type EncodedJsonParams = [
  joinedEncodedKeys: string,
  encodedPrimitive: string
][];

function encodeKey(key: Key): string {
  return String(key);
}

function decodeKey(encoded: string): Key {
  const asNumber = Number(encoded);
  return Number.isInteger(asNumber) ? asNumber : encoded;
}

function encodeJsonParams(jsonParams: JsonParams): EncodedJsonParams {
  return jsonParams.map(([keys, primitive]) => [
    keys.map(encodeKey).join("."),
    primitive,
  ]);
}

function decodeJsonParams(encodedJsonParams: EncodedJsonParams): JsonParams {
  return encodedJsonParams.map(([joinedKeys, primitive]) => [
    joinedKeys.split(".").map(decodeKey),
    primitive,
  ]);
}

function toJsonParams(data: any): JsonParams {
  const jsonParams: JsonParams = [];
  function recurse(keys: Key[], data: any) {
    assert.ok(
      data !== null &&
        typeof data !== undefined &&
        typeof data !== "number" &&
        typeof data !== "boolean"
    );
    if (typeof data === "string") {
      jsonParams.push([keys, data]);
      return;
    }
    if (Array.isArray(data)) {
      data.forEach((v, k) => {
        recurse([...keys, k], v);
      });
      return;
    }
    for (const [k, v] of Object.entries(data)) {
      recurse([...keys, k], v);
    }
  }
  recurse([], data);
  return jsonParams;
}

function fromJsonParams(jsonParams: JsonParams): any {
  interface Node {
    primitive?: Primitive;
    children: Map<Key, Node>;
  }

  // Reconstruct as Node
  const root: Node = { children: new Map() };
  for (const [keys, primitive] of jsonParams) {
    let node = root;
    for (const key of keys) {
      if (!node.children.has(key)) {
        node.children.set(key, { children: new Map() });
      }
      node = node.children.get(key)!;
    }
    assert.ok(typeof node.primitive === "undefined");
    node.primitive = primitive;
  }

  // Restore to object
  function recurse(node: Node): any {
    if (node.children.size === 0) {
      assert.ok(typeof node.primitive !== "undefined");
      return node.primitive;
    }
    const keys = Array.from(node.children.keys());
    if (keys.every((key) => typeof key === "number" && Number.isInteger(key))) {
      const result: any[] = [];
      for (const key of keys) {
        result[key as number] = recurse(node.children.get(key)!);
      }
      return result;
    }
    if (keys.every((key) => typeof key === "string")) {
      const result: any = {};
      for (const key of keys) {
        result[key as string] = recurse(node.children.get(key)!);
      }
      return result;
    }
    assert.ok(false);
  }
  return recurse(root);
}
