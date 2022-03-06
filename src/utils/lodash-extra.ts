export function keys<T>(x: T): (keyof T)[] {
  return Object.keys(x) as any;
}

export function entries<T>(x: T): [keyof T, T[keyof T]][] {
  return Object.entries(x) as any;
}

export function entriesV2<T>(
  x: T
): { [K in keyof T]: { k: K; v: T[K] }[] }[keyof T] {
  return Object.entries(x).map(([k, v]) => ({ k, v })) as any;
}
