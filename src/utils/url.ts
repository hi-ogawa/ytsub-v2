import { useNavigate, useSearchParams } from "react-router-dom";
import { Result } from "ts-results";
import * as assert from "./assert";
import { fromFlatTree, toFlatTree } from "./flat-json";
import { wrapError } from "./misc";

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

function toJsonSearchParams(data: any, root: string = ""): URLSearchParams {
  const tree = toFlatTree({ [root]: data });
  assert.ok(typeof tree !== "string");
  return new URLSearchParams(tree as any);
}

function fromJsonSearchParams(params: URLSearchParams, root: string = ""): any {
  const tree = new Map<string, string>(params as any);
  const data = fromFlatTree(tree);
  assert.ok(root in data);
  return data[root];
}
