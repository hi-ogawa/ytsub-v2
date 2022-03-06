import superjson from "superjson";

export function deepcopy<T>(x: T): T {
  return superjson.deserialize(superjson.serialize(x));
}
