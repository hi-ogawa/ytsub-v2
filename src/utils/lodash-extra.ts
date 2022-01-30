export function keys<T>(x: T): (keyof T)[] {
  return Object.keys(x) as any;
}

export function entries<T>(x: T): [keyof T, T[keyof T]][] {
  return Object.entries(x) as any;
}
