//
// Cheap low quality uuid-ish thing generator
//

// 32 bit hash by Chris Wellons https://nullprogram.com/blog/2018/07/31/
export function hash32(x: number): number {
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

export class Rng {
  constructor(private seed: number = 1) {}

  next(): number {
    return hash32(this.seed++);
  }

  id(seed64: number = Date.now()): string {
    let hi = (seed64 >> 32) & 0xffffffff;
    let lo = seed64 & 0xffffffff;
    hi = hash32(hash32(hi) ^ this.next());
    lo = hash32(hash32(lo) ^ this.next());
    return (
      "0x" + hi.toString(16).padStart(8, "0") + lo.toString(16).padStart(8, "0")
    );
  }
}

export const rng = new Rng();
