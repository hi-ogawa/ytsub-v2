import { Err, Ok, Result } from "ts-results";

// TODO: Use something similar to parse_nested_query https://codefol.io/posts/How-Does-Rack-Parse-Query-Params-With-parse-nested-query/

export function toSearchParams(
  data: any,
  key: string = "data"
): URLSearchParams {
  return new URLSearchParams({ [key]: JSON.stringify(data) });
}

export function fromSearchParams<T>(
  params: URLSearchParams,
  key: string = "data"
): Result<T, Error> {
  const dataRaw = params.get(key);
  try {
    return Ok(JSON.parse(dataRaw!) as unknown as T);
  } catch (e) {
    return Err(e as Error);
  }
}
