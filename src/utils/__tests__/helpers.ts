import { describe } from "@jest/globals";

export function describeOnlyEnv(blockName: string, blockFn: () => void): void {
  (process.env.DESCRIBE?.includes(blockName) ? describe : describe.skip)(
    blockName,
    blockFn
  );
}
