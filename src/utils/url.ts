import { useNavigate, useSearchParams } from "react-router-dom";
import { Err, Ok, Result } from "ts-results";
import { fromJsonSearchParams, toJsonSearchParams } from "./json-search-params";

export function useNavigateCustom() {
  const navigate = useNavigate();
  function navigateExtra(pathname: string, data: any) {
    const search = wrapError(() => "?" + toJsonSearchParams(data)).unwrapOr("");
    navigate({ pathname, search });
  }
  return navigateExtra;
}

export function useSearchParamsCustom<T>(): Result<T, Error> {
  const [searchParams] = useSearchParams();
  return wrapError(() => fromJsonSearchParams(searchParams));
}

function wrapError<T>(f: () => T): Result<T, Error> {
  try {
    return Ok(f());
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    }
    return Err(new Error(String(e)));
  }
}
