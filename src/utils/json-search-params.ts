import * as assert from "./assert";
import {
  fromPathJson,
  Key,
  PathJson,
  Primitive,
  toPathJson,
} from "./path-json";

export function toJsonSearchParams(data: any): URLSearchParams {
  return new URLSearchParams(encodePathJson(toPathJson(data)));
}

export function fromJsonSearchParams(params: URLSearchParams): any {
  const entries = Array.from((params as any).entries()) as any;
  return fromPathJson(decodePathJson(entries));
}

type EncodedPathJson = [keys: string, primitive: string][];

function encodeKey(key: Key): string {
  if (typeof key === "string") {
    // Disallow number-like string
    assert.ok(!Number.isInteger(Number(key)));
  }
  return String(key);
}

function decodeKey(encoded: string): Key {
  const asNumber = Number(encoded);
  return Number.isInteger(asNumber) ? asNumber : encoded;
}

function encodeKeys(keys: Key[]): string {
  return keys.map(encodeKey).join(".");
}

function decodeKeys(encoded: string): Key[] {
  return encoded.split(".").map(decodeKey);
}

function encodePrimitive(primitive: Primitive): string {
  if (typeof primitive === "string") {
    return primitive;
  }
  // Disallow non-string
  assert.ok(false);
}

function decodePrimitive(encoded: string): Primitive {
  return encoded;
}

function encodePathJson(pathJson: PathJson): EncodedPathJson {
  return pathJson.map(({ keys, primitive }) => [
    encodeKeys(keys),
    encodePrimitive(primitive),
  ]);
}

function decodePathJson(encoded: EncodedPathJson): PathJson {
  return encoded.map(([keys, primitive]) => ({
    keys: decodeKeys(keys),
    primitive: decodePrimitive(primitive),
  }));
}
