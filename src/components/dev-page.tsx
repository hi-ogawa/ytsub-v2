import { useSnackbar } from "notistack";
import * as React from "react";
import { DUMP } from "../utils/demo-entries";
import {
  useBookmarkEntries,
  useHistoryEntries,
  useLanguageSetting,
  usePracticeSystem,
} from "../utils/storage";
import { groupBookmarkEntries } from "../utils/types";

export function DevPage() {
  const [languageSettings] = useLanguageSetting();
  const [historyEntries, , , setHistoryEntries] = useHistoryEntries();
  const [bookmarkEntries, , , setBookmarkEntries] = useBookmarkEntries();
  const [practiceSystem, setPracticeSystem] = usePracticeSystem();
  const { enqueueSnackbar } = useSnackbar();
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
    enqueueSnackbar("local stroage exported");
  }

  function clearLocalStorage() {
    const ok = confirm("Are you sure?");
    if (ok) {
      localStorage.clear();
      enqueueSnackbar("local storage cleared");
    }
  }

  function loadDumpHistoryEntries() {
    setHistoryEntries(DUMP.historyEntries);
    enqueueSnackbar("history entries loaded");
  }

  function loadDumpBookmarkEntries() {
    setBookmarkEntries(DUMP.bookmarkEntries);
    enqueueSnackbar("bookmark entries loaded");
  }

  function loadPracticeEntries() {
    // Group and order it
    const groups = groupBookmarkEntries(bookmarkEntries);
    for (const key in groups) {
      for (const entry of groups[key]) {
        practiceSystem.addNewEntry(entry);
      }
    }
    setPracticeSystem(practiceSystem);
    enqueueSnackbar("practice entries loaded");
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
          <a ref={ref as any} className="hidden"></a>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={exportLocalStorage}
          >
            Export local storage
          </button>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={clearLocalStorage}
          >
            Clear local storage
          </button>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={loadDumpHistoryEntries}
          >
            Load dump (history)
          </button>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={loadDumpBookmarkEntries}
          >
            Load dump (bookmark)
          </button>
          <button
            className="w-60 p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={loadPracticeEntries}
          >
            Load practice entries
          </button>
        </div>
      </div>
    </div>
  );
}
