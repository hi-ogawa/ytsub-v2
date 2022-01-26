import { describe } from "@jest/globals";

export function describeOnlyEnv(blockName: string, blockFn: () => void): void {
  (process.env.DESCRIBE?.includes(blockName) ? describe.only : describe.skip)(
    blockName,
    blockFn
  );
}

interface JsonVisitor {
  visit: (x: any) => any;
  null: (x: null) => any;
  boolean: (x: boolean) => any;
  number: (x: number) => any;
  string: (x: string) => any;
  array: (x: any[]) => any;
  object: (x: object) => any;
}

class BaseVisitor implements JsonVisitor {
  visit(x: any): any {
    if (x === null) {
      return this.null(x);
    }
    if (typeof x === "boolean") {
      return this.boolean(x);
    }
    if (typeof x === "number") {
      return this.number(x);
    }
    if (typeof x === "string") {
      return this.string(x);
    }
    if (Array.isArray(x)) {
      return this.array(x);
    }
    return this.object(x);
  }
  null(x: null) {
    return x;
  }
  boolean(x: boolean) {
    return x;
  }
  number(x: number) {
    return x;
  }
  string(x: string) {
    return x;
  }
  array(x: any[]): any[] {
    return x.map((y) => this.visit(y));
  }
  object(x: object): object {
    return Object.fromEntries(
      Object.entries(x).map(([k, v]) => [this.visit(k), this.visit(v)])
    );
  }
}

// Convert `-0` to `0`
export class NormalizeZeroVisitor extends BaseVisitor {
  number(x: number): number {
    if (x === 0) return 0;
    return x;
  }
}
