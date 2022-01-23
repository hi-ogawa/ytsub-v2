export function encode(data: any): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function decode(encoded: string): any {
  return JSON.parse(decodeURIComponent(encoded));
}
