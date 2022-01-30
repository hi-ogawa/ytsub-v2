import * as assert from "./assert";

export type Primitive = null | boolean | number | string | {} | [];
export type Key = string | number;
export type PathJson = { path: Key[]; primitive: Primitive }[];

export function isPrimitive(data: unknown): data is Primitive {
  if (
    data === null ||
    typeof data === "boolean" ||
    typeof data === "number" ||
    typeof data === "string"
  ) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  if (typeof data === "object") {
    return Object.keys(data).length === 0;
  }
  return false;
}

export function toPathJson(data: unknown): PathJson {
  const pathJson: PathJson = [];
  function recurse(path: Key[], data: unknown) {
    if (isPrimitive(data)) {
      pathJson.push({ path, primitive: data });
      return;
    }
    if (Array.isArray(data)) {
      data.forEach((v, k) => {
        recurse([...path, k], v);
      });
      return;
    }
    if (typeof data === "object") {
      assert.type<object>(data);
      for (const [k, v] of Object.entries(data)) {
        recurse([...path, k], v);
      }
      return;
    }
    assert.ok(false);
  }
  recurse([], data);
  return pathJson;
}

export function fromPathJson(pathJson: PathJson): unknown {
  interface Node {
    primitive?: Primitive;
    children: Map<Key, Node>;
  }

  // Reconstruct as Node
  const root: Node = { children: new Map() };
  for (const { path, primitive } of pathJson) {
    let node = root;
    for (const key of path) {
      if (!node.children.has(key)) {
        node.children.set(key, { children: new Map() });
      }
      node = node.children.get(key)!;
    }
    assert.ok(typeof node.primitive === "undefined");
    node.primitive = primitive;
  }

  // Validate and restore
  function recurse(node: Node): unknown {
    if (node.children.size === 0) {
      assert.ok(typeof node.primitive !== "undefined");
      return node.primitive;
    }

    const keys = Array.from(node.children.keys());
    if (keys.every((key) => typeof key === "number" && Number.isInteger(key))) {
      assert.type<number[]>(keys);
      const result: unknown[] = [];
      for (const key of keys) {
        result[key] = recurse(node.children.get(key)!);
      }
      return result;
    }

    if (keys.every((key) => typeof key === "string")) {
      assert.type<string[]>(keys);
      const result: any = {};
      for (const key of keys) {
        result[key] = recurse(node.children.get(key)!);
      }
      return result;
    }
    assert.ok(false);
  }
  return recurse(root);
}
