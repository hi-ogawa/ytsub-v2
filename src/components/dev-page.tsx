import * as React from "react";
import {
  useBookmarkEntries,
  useHistoryEntries,
  useLanguageSetting,
  usePracticeSystem,
} from "../utils/storage";

export function DevPage() {
  const [languageSettings] = useLanguageSetting();
  const [historyEntries] = useHistoryEntries();
  const [bookmarkEntries] = useBookmarkEntries();
  const [practiceSystem] = usePracticeSystem();
  const ref = React.useRef<HTMLElement>();

  function exportLocalStorage() {
    const data = {
      languageSettings,
      historyEntries,
      bookmarkEntries,
      practiceSystem: practiceSystem.serialize(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const el = ref.current!;
    el.setAttribute("href", url);
    el.setAttribute("download", "ytsub-v2-local-storage.json");
    el.click();
  }

  function clearLocalStorage() {
    const ok = confirm("Are you sure?");
    if (ok) {
      localStorage.clear();
    }
  }

  return (
    <div className="sm:p-4 h-full flex justify-center">
      <div
        className="
          w-full sm:max-w-lg
          h-full
          flex flex-col
          sm:border border-solid border-gray-200
        "
      >
        <div className="flex-auto flex flex-col items-center justify-center p-4 gap-4 bg-white">
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={exportLocalStorage}
          >
            Export local storage
            <a ref={ref as any} className="hidden"></a>
          </button>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={clearLocalStorage}
          >
            Clear local storage
          </button>
        </div>
      </div>
    </div>
  );
}
