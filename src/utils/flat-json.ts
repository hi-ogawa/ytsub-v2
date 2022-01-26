import * as assert from "./assert";

/*

Path
  Key
  Key . Path

Key
  escape(<string>, "\", "_", ".")
  _<number>

Leaf
  _{}
  _[]
  _null
  _true
  _false
  _<number>
  escape(<string>, "\", "_", ".")  TOOD: doesn't have to escape "."

*/

const PATH_SEPARATOR = ".";
const SPECIAL_PREFIX = "_";
const ESCAPE_CHARS = ["\\", PATH_SEPARATOR, SPECIAL_PREFIX];

type Key = string | number;
type Leaf = string;
type Tree = Leaf | Map<Key, Tree>;
type PathTree = Leaf | Map<Key[], Leaf>;
type FlatTree = Leaf | Map<string, Leaf>;
type FlatJson = string | Record<string, string>;

function escapeStringKey(key: string): string {
  return key
    .replaceAll("\\", "\\\\")
    .replaceAll(PATH_SEPARATOR, "\\" + PATH_SEPARATOR)
    .replaceAll(SPECIAL_PREFIX, "\\" + SPECIAL_PREFIX);
}

function unescapeStringKey(escaped: string): string {
  return escaped
    .replaceAll("\\\\", "\\")
    .replaceAll("\\" + PATH_SEPARATOR, PATH_SEPARATOR)
    .replaceAll("\\" + SPECIAL_PREFIX, SPECIAL_PREFIX);
  // let result = "";
  // for (let i = 0; i < escaped.length; i++) {
  //   if (escaped[i] == "\\") {
  //     i++;
  //     assert.ok(ESCAPE_CHARS.includes(escaped[i]));
  //     result += escaped[i];
  //     continue;
  //   }
  //   result += escaped[i];
  // }
  // return result;
}

function escapeKey(key: string | number): string {
  if (typeof key === "number") {
    return SPECIAL_PREFIX + key;
  }
  if (typeof key === "string") {
    return escapeStringKey(key);
  }
  assert.ok(false);
}

function unescapeKey(escapedKey: string): string | number {
  if (escapedKey.startsWith(SPECIAL_PREFIX)) {
    const key = JSON.parse(escapedKey.slice(SPECIAL_PREFIX.length));
    assert.ok(typeof key === "number");
    assert.ok(Number.isInteger(key));
    return key;
  }
  return unescapeStringKey(escapedKey);
}

function keysToPath(keys: (string | number)[]): string {
  return keys.map(escapeKey).join(PATH_SEPARATOR);
}

function pathToKeys(path: string): (string | number)[] {
  const escapedKeys: string[] = [];
  let sep = 0;
  for (let i = 0; i < path.length; i++) {
    if (path[i] === "\\") {
      i++;
      assert.ok(ESCAPE_CHARS.includes(path[i]));
      continue;
    }
    if (path[i] === PATH_SEPARATOR) {
      escapedKeys.push(path.slice(sep, i));
      sep = i + 1;
    }
  }
  escapedKeys.push(path.slice(sep));
  return escapedKeys.map(unescapeKey);
}

function toTree(data: any): Tree {
  if (data === null) {
    return SPECIAL_PREFIX + "null";
  }
  if (data === true) {
    return SPECIAL_PREFIX + "true";
  }
  if (data === false) {
    return SPECIAL_PREFIX + "false";
  }
  if (typeof data === "number") {
    return SPECIAL_PREFIX + JSON.stringify(data);
  }
  if (typeof data === "string") {
    return escapeStringKey(data);
    // if (data.startsWith(SPECIAL_PREFIX)) {
    //   return "\\" + data;
    // }
    // return data;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return SPECIAL_PREFIX + "[]";
    }
    return new Map(data.map((value, i) => [i, toTree(value)]));
  }
  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return SPECIAL_PREFIX + "{}";
    }
    return new Map(entries.map(([key, value]) => [key, toTree(value)]));
  }
  assert.ok(false);
}

function fromTree(tree: Tree): any {
  if (typeof tree === "string") {
    if (tree.startsWith(SPECIAL_PREFIX)) {
      const slice = tree.slice(1);
      if (slice === "null") {
        return null;
      }
      if (slice === "true") {
        return true;
      }
      if (slice === "false") {
        return false;
      }
      if (slice === "[]") {
        return [];
      }
      if (slice === "{}") {
        return {};
      }
      const data = JSON.parse(slice);
      assert.ok(typeof data === "number");
      return data;
    }
    return unescapeStringKey(tree);
    // if (tree.startsWith("\\" + SPECIAL_PREFIX)) {
    //   return tree.slice(1);
    // }
    // return tree;
  }

  assert.ok(tree.size > 0);
  const keys = Array.from(tree.keys());
  if (keys.every((key) => typeof key === "number")) {
    const result: any[] = [];
    for (const key of keys) {
      assert.ok(typeof key === "number");
      const value = tree.get(key);
      assert.ok(typeof value !== "undefined");
      result[key] = fromTree(value);
    }
    return result;
  }
  if (keys.every((key) => typeof key === "string")) {
    const result: any = {};
    for (const key of keys) {
      assert.ok(typeof key === "string");
      const value = tree.get(key);
      assert.ok(typeof value !== "undefined");
      result[key] = fromTree(value);
    }
    return result;
  }
  assert.ok(false);
}

function treeToPathTree(tree: Tree): PathTree {
  if (typeof tree === "string") {
    return tree;
  }
  const pathTree = new Map<Key[], Leaf>();
  for (const [key, childTree] of tree.entries()) {
    const childPathTree = treeToPathTree(childTree);
    if (typeof childPathTree === "string") {
      pathTree.set([key], childPathTree);
    } else {
      for (const [path, leaf] of childPathTree.entries()) {
        pathTree.set([key, ...path], leaf);
      }
    }
  }
  return pathTree;
}

function treeFromPathTree(pathTree: PathTree): Tree {
  if (typeof pathTree === "string") {
    return pathTree;
  }

  function getOrInitNode(node: Map<Key, Tree>, key: Key): Map<Key, Tree> {
    let childNode = node.get(key);
    if (childNode) {
      assert.ok(childNode instanceof Map);
    } else {
      childNode = new Map<Key, Tree>();
      node.set(key, childNode);
    }
    return childNode;
  }

  const tree = new Map<Key, Tree>();
  for (const [path, leaf] of pathTree.entries()) {
    assert.ok(path.length > 0);
    let node = tree;
    for (let i = 0; i < path.length; i++) {
      const k = path[i];
      if (i < path.length - 1) {
        node = getOrInitNode(node, path[i]);
      } else {
        assert.ok(typeof node.get(k) === "undefined");
        node.set(k, leaf);
      }
    }
  }
  return tree;
}

function mapKeys<K1, V, K2>(map: Map<K1, V>, f: (x: K1) => K2): Map<K2, V> {
  const result = new Map<K2, V>();
  for (const [k1, v] of map.entries()) {
    result.set(f(k1), v);
  }
  return result;
}

function pathTreeToFlatTree(pathTree: PathTree): FlatTree {
  if (typeof pathTree === "string") {
    return pathTree;
  }
  return mapKeys(pathTree, keysToPath);
}

function pathTreeFromFlatTree(flatTree: FlatTree): PathTree {
  if (typeof flatTree === "string") {
    return flatTree;
  }
  return mapKeys(flatTree, pathToKeys);
}

export function toFlatTree(data: any): FlatTree {
  return pathTreeToFlatTree(treeToPathTree(toTree(data)));
}

export function fromFlatTree(flatTree: FlatTree): any {
  return fromTree(treeFromPathTree(pathTreeFromFlatTree(flatTree)));
}

export function toFlatJson(data: any): FlatJson {
  const flatTree = toFlatTree(data);
  if (typeof flatTree === "string") {
    return flatTree;
  }
  return Object.fromEntries(flatTree.entries());
}

export function fromFlatJson(flatJson: FlatJson): any {
  return fromFlatTree(
    typeof flatJson === "string" ? flatJson : new Map(Object.entries(flatJson))
  );
}
