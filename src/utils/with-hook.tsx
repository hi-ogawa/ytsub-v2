import * as React from "react";
import { Result } from "ts-results";

// TODO: overload all the variants by a single function
// TODO: testing
// TODO: `ErrComponent` in a different branche will be remounted (e.g. CircularProgress resets its state)

export function withHookX<T0, S, E>(
  hook: (data: T0) => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType<{ data: T0 }> {
  return function WithHook({ data }: { data: T0 }) {
    const result = hook(data);
    if (result.ok) {
      return <OkComponent data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}

export function withHook<S, E>(
  hook: () => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType {
  return function WithHook() {
    const result = hook();
    if (result.ok) {
      return <OkComponent data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}

export function withHook2X<T0, T1, S, E>(
  hook0: (data: T0) => Result<T1, E>,
  hook1: (data: T1) => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType<{ data: T0 }> {
  const OkComponent1 = withHookX(hook1, OkComponent, ErrComponent);

  return function WithHook2({ data }: { data: T0 }) {
    const result = hook0(data);
    if (result.ok) {
      return <OkComponent1 data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}

export function withHook2<T1, S, E>(
  hook0: () => Result<T1, E>,
  hook1: (data: T1) => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType {
  const OkComponent1 = withHookX(hook1, OkComponent, ErrComponent);

  return function WithHook2() {
    const result = hook0();
    if (result.ok) {
      return <OkComponent1 data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}

export function withHook3X<T0, T1, T2, S, E>(
  hook0: (data: T0) => Result<T1, E>,
  hook1: (data: T1) => Result<T2, E>,
  hook2: (data: T2) => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType<{ data: T0 }> {
  const OkComponent2 = withHook2X(hook1, hook2, OkComponent, ErrComponent);

  return function WithHook3({ data }: { data: T0 }) {
    const result = hook0(data);
    if (result.ok) {
      return <OkComponent2 data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}

export function withHook3<T1, T2, S, E>(
  hook0: () => Result<T1, E>,
  hook1: (data: T1) => Result<T2, E>,
  hook2: (data: T2) => Result<S, E>,
  OkComponent: React.ComponentType<{ data: S }>,
  ErrComponent: React.ComponentType<{ data: E }>
): React.ComponentType {
  const OkComponent2 = withHook2X(hook1, hook2, OkComponent, ErrComponent);

  return function WithHook3() {
    const result = hook0();
    if (result.ok) {
      return <OkComponent2 data={result.val} />;
    }
    return <ErrComponent data={result.val} />;
  };
}
