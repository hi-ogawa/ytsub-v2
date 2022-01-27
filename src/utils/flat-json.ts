import * as assert from "./assert";
import { BaseVisitor } from "./__tests__/helpers";

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
  escape(<string>, "\", "_")

*/

const PATH_SEPARATOR = ".";
const NUMBER_KEY_PREFIX = "_";
const LEAF_NON_STRING_PREFIX = "_";

type Key = string | number;
type Leaf = string;
type Tree = Leaf | Map<Key, Tree>;
type PathTree = Leaf | Map<Key[], Leaf>;
type FlatTree = Leaf | Map<string, Leaf>;
type FlatJson = string | Record<string, string>;

function escapeString(input: string, specials: string[]): string {
  for (let i = 0; i < specials.length; i++) {
    input = input.replaceAll(specials[i], "\\" + specials[i]);
  }
  return input;
}

function unescapeString(input: string, specials: string[]): string {
  for (let i = specials.length - 1; i >= 0; i--) {
    input = input.replaceAll("\\" + specials[i], specials[i]);
  }
  return input;
}

function escapeKey(key: string | number): string {
  if (typeof key === "number") {
    return NUMBER_KEY_PREFIX + key;
  }
  if (typeof key === "string") {
    return escapeString(key, ["\\", NUMBER_KEY_PREFIX, PATH_SEPARATOR]);
  }
  assert.ok(false);
}

function unescapeKey(escapedKey: string): string | number {
  if (escapedKey.startsWith(NUMBER_KEY_PREFIX)) {
    const key = JSON.parse(escapedKey.slice(1));
    assert.ok(typeof key === "number");
    assert.ok(Number.isInteger(key));
    return key;
  }
  return unescapeString(escapedKey, ["\\", NUMBER_KEY_PREFIX, PATH_SEPARATOR]);
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
      assert.ok(["\\", PATH_SEPARATOR, NUMBER_KEY_PREFIX].includes(path[i]));
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

function toRecordV2(data: any, root: string): Record<string, string> {
  const result: Record<string, string> = {};
  function traverse(data: any, path: string): void {
    if (data === null) {
      result[path] = LEAF_NON_STRING_PREFIX + "null";
    } if (data === true) {
      result[path] = LEAF_NON_STRING_PREFIX + "true";
    } else if (data === false) {
      result[path] = LEAF_NON_STRING_PREFIX + "false";
    } else if (typeof data === "number") {
      result[path] = LEAF_NON_STRING_PREFIX + JSON.stringify(data);
    } else if (typeof data === "string") {
      result[path] = escapeString(data, ["\\", LEAF_NON_STRING_PREFIX]);
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        result[path] = LEAF_NON_STRING_PREFIX + "[]";
      } else {
        for (let i = 0; i < data.length; i++) {
          traverse(data[i], path + PATH_SEPARATOR + escapeKey(i))
        }
      }
    } else if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        result[path] = LEAF_NON_STRING_PREFIX + "{}";
      } else {
        for (const [k, v] of entries) {
          traverse(v, path + PATH_SEPARATOR + escapeKey(k));
        }
      }
    }
  }
  traverse(data, escapeKey(root));
  return result;
}

import * as _ from "lodash";

function fromRecord(record: Record<string, string>, root: string): any {
  const pairs = _.toPairs(record).map(([path, leaf]) => [pathToKeys(path), leaf]);
  for (const [path, leaf] of pairs) {
  };
  const result: Record<string, string> = {};
  function traverse(data: any, path: string): void {
    if (data === null) {
      result[path] = LEAF_NON_STRING_PREFIX + "null";
    } if (data === true) {
      result[path] = LEAF_NON_STRING_PREFIX + "true";
    } else if (data === false) {
      result[path] = LEAF_NON_STRING_PREFIX + "false";
    } else if (typeof data === "number") {
      result[path] = LEAF_NON_STRING_PREFIX + JSON.stringify(data);
    } else if (typeof data === "string") {
      result[path] = escapeString(data, ["\\", LEAF_NON_STRING_PREFIX]);
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        result[path] = LEAF_NON_STRING_PREFIX + "[]";
      } else {
        for (let i = 0; i < data.length; i++) {
          traverse(data[i], path + PATH_SEPARATOR + escapeKey(i))
        }
      }
    } else if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        result[path] = LEAF_NON_STRING_PREFIX + "{}";
      } else {
        for (const [k, v] of entries) {
          traverse(v, path + PATH_SEPARATOR + escapeKey(k));
        }
      }
    }
  }
}

function toRecord(data: any, root: string): Record<string, string> {
  function* rec(data: any, keys: Key[]): Generator<[Key[], Leaf]> {
    if (data === null) {
      const leaf = LEAF_NON_STRING_PREFIX + "null";
      yield [keys, leaf];
    } else if (data === true) {
      const leaf = LEAF_NON_STRING_PREFIX + "true";
      yield [keys, leaf];
    } else if (data === false) {
      const leaf = LEAF_NON_STRING_PREFIX + "false";
      yield [keys, leaf];
    } else if (typeof data === "number") {
      const leaf = LEAF_NON_STRING_PREFIX + JSON.stringify(data);
      yield [keys, leaf];
    } else if (typeof data === "string") {
      const leaf = escapeString(data, ["\\", LEAF_NON_STRING_PREFIX]);
      yield [keys, leaf];
    } else if (Array.isArray(data)) {
      if (data.length === 0) {
        const leaf = LEAF_NON_STRING_PREFIX + "[]";
        yield [keys, leaf];
      } else {
        for (let i = 0; i < data.length; i++) {
          yield* rec(data[i], [...keys, i]);
        }
      }
    } else if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        yield [keys, LEAF_NON_STRING_PREFIX + "{}"];
      } else {
        for (const [k, v] of entries) {
          yield* rec(v, [...keys, k]);
        }
      }
    }
    assert.ok(false);
  }
  return Object.fromEntries(Array.from(rec(data, [root]), ([keys, leaf]) => [keysToPath(keys), leaf]));
}

function toTree(data: any): Tree {
  if (data === null) {
    return LEAF_NON_STRING_PREFIX + "null";
  }
  if (data === true) {
    return LEAF_NON_STRING_PREFIX + "true";
  }
  if (data === false) {
    return LEAF_NON_STRING_PREFIX + "false";
  }
  if (typeof data === "number") {
    return LEAF_NON_STRING_PREFIX + JSON.stringify(data);
  }
  if (typeof data === "string") {
    return escapeString(data, ["\\", LEAF_NON_STRING_PREFIX]);
  }
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return LEAF_NON_STRING_PREFIX + "[]";
    }
    return new Map(data.map((value, i) => [i, toTree(value)]));
  }
  if (typeof data === "object") {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return LEAF_NON_STRING_PREFIX + "{}";
    }
    return new Map(entries.map(([key, value]) => [key, toTree(value)]));
  }
  assert.ok(false);
}

function fromTree(tree: Tree): any {
  if (typeof tree === "string") {
    if (tree.startsWith(LEAF_NON_STRING_PREFIX)) {
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
    return unescapeString(tree, ["\\", LEAF_NON_STRING_PREFIX]);
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
