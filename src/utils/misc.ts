import { Err, Ok, Result } from "ts-results";

export function wrapError<T>(f: () => T): Result<T, Error> {
  try {
    return Ok(f());
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    }
    return Err(new Error(String(e)));
  }
}

export async function wrapReject<T>(
  f: () => Promise<T>
): Promise<Result<T, Error>> {
  try {
    return Ok(await f());
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    }
    return Err(new Error(String(e)));
  }
}
