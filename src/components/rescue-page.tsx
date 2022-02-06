import * as React from "react";
import { FallbackProps } from "react-error-boundary";

export function RescuePage(props: Partial<FallbackProps>) {
  function resetLocalStorage() {
    if (confirm("Are you sure?")) {
      localStorage.clear();
    }
  }

  function reloadPage() {
    if (props.resetErrorBoundary) {
      props.resetErrorBoundary();
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 gap-4">
      <button
        className="flex-none w-60 p-2 bg-blue-500 text-white shadow rounded"
        onClick={resetLocalStorage}
      >
        Reset local storage
      </button>
      <button
        className="flex-none w-60 p-2 bg-blue-500 text-white shadow rounded"
        onClick={reloadPage}
      >
        Reload page
      </button>
      <div className="w-full flex-auto border border-solid border-red-200 bg-red-50 rounded p-2 font-mono text-sm">
        {String(props.error)}
      </div>
    </div>
  );
}
