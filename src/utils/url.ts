import { Static, TSchema, Type } from "@sinclair/typebox";
import Ajv from "ajv";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Err, Ok, Result } from "ts-results";
import { fromJsonSearchParams, toJsonSearchParams } from "./json-search-params";

export function useNavigateCustom() {
  const navigate = useNavigate();
  function navigateExtra(pathname: string, data: any) {
    navigate({ pathname, search: "?" + toJsonSearchParams(data) });
  }
  return navigateExtra;
}

export function useJsonSearchParams<T extends TSchema>(
  schema: T
): Result<Static<T>, Error> {
  const [searchParams] = useSearchParams();
  return wrapError(() => fromJsonSearchParams(searchParams)).andThen((data) => {
    if (!ajv.validate(Type.Strict(schema), data)) {
      console.error(ajv.errors);
      return Err(new ValidationError(ajv.errors));
    }
    return Ok(data as Static<T>);
  });
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

const ajv = new Ajv();

class ValidationError extends Error {
  constructor(public errors: any) {
    super();
  }
}
