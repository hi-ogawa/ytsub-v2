import { useNavigate, useSearchParams } from "react-router-dom";
import { Err, Ok, Result } from "ts-results";
import { fromFlatJson, toFlatJson } from "./flat-json";

export function useNavigateCustom() {
  const navigate = useNavigate();
  function navigateExtra(pathname: string, data: any) {
    let search = "";
    try {
      const flatJson = toFlatJson(data);
      if (typeof flatJson !== "string") {
        search = "?" + new URLSearchParams(flatJson).toString();
      }
    } catch (e) {
      console.error(e);
    }
    navigate({ pathname, search });
  }
  return navigateExtra;
}

export function useSearchParamsCustom<T>(): Result<T, Error> {
  const [searchParams] = useSearchParams();
  try {
    const flatJson = Object.fromEntries((searchParams as any).entries());
    return Ok(fromFlatJson(flatJson));
  } catch (e) {
    if (e instanceof Error) {
      return Err(e);
    }
    return Err(new Error());
  }
}
