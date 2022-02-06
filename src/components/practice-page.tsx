import { CircularProgress } from "@mui/material";
import * as React from "react";
import { AnswerType, PracticeEntry, PracticeSystem } from "../utils/practice";
import { usePracticeSystem } from "../utils/storage";
import { BookmarkEntryComponent } from "./bookmark-list-page";

export function PracticePage() {
  const [system, setSystem] = usePracticeSystem();
  const [entry, setEntry] = React.useState<PracticeEntry>();
  const [started, setStarted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  function initialize() {
    system.resetOnNewDay();
    const nextEntry = system.getNextEntry();
    setEntry(nextEntry);
    setSystem(system);
  }

  function answerEntry(entry: PracticeEntry, type: AnswerType) {
    system.answerEntry(entry, type);
    initialize();
  }

  React.useEffect(() => {
    // Fake loading to render after `initialize`
    const timeout = setTimeout(() => {
      initialize();
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

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
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <CircularProgress size={60} />
          </div>
        ) : (
          <>
            <PracticeStatistics system={system} />
            <div className="w-full flex-[1_0_0] overflow-y-auto bg-white">
              {entry ? (
                started ? (
                  <PracticeSessionComponent
                    entry={entry}
                    answerEntry={answerEntry}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <button
                      className="p-2 bg-blue-500 text-white shadow-md rounded"
                      onClick={() => setStarted(true)}
                    >
                      Start practice
                    </button>
                  </div>
                )
              ) : (
                <div className="h-full flex items-center justify-center">
                  Practice finished!
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PracticeStatistics({ system }: { system: PracticeSystem }) {
  return (
    <div className="flex-none bg-gray-100 flex flex-col py-1 px-3 text-sm text-gray-600">
      <div className="flex items-center">
        <div className="flex-none w-[6rem]">Daily Progress</div>
        <div className="flex-auto w-full flex justify-center text-gray-400 text-base">
          <div className="text-blue-500 w-[3.2rem] text-center">
            {system.counts.NEW}
          </div>
          -
          <div className="text-red-500 w-[3.2rem] text-center">
            {system.counts.LEARN}
          </div>
          -
          <div className="text-green-500 w-[3.2rem] text-center">
            {system.counts.REVIEW}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex-none w-[6rem]">Queue Size</div>
        <div className="flex-auto w-full flex justify-center text-gray-400 text-base">
          <div className="text-blue-500 w-[3.2rem] text-center">
            {system.queues.NEW.length}
          </div>
          -
          <div className="text-red-500 w-[3.2rem] text-center">
            {system.queues.LEARN.length}
          </div>
          -
          <div className="text-green-500 w-[3.2rem] text-center">
            {system.queues.REVIEW.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PracticeSessionComponent({
  entry,
  answerEntry,
}: {
  entry: PracticeEntry;
  answerEntry: (entry: PracticeEntry, type: AnswerType) => void;
}) {
  // TODO: auto play audio/video as a first hint
  const [isAnswerShown, setIsAnswerShown] = React.useState(false);

  function answerEntryAndReset(type: AnswerType): void {
    answerEntry(entry, type);
    setIsAnswerShown(false);
  }

  // TODO: maybe buttons as the bottom bar
  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex-auto">
        <BookmarkEntryComponent
          entry={entry.bookmark}
          openOverride={isAnswerShown}
        />
      </div>
      <div className="h-12 flex-none flex items-center justify-center text-sm">
        {isAnswerShown ? (
          <div className="flex shadow-md rounded overflow-hidden">
            <button
              className="flex-none w-16 p-2 bg-blue-500 text-white border-r border-solid border-blue-400"
              onClick={() => answerEntryAndReset("AGAIN")}
            >
              Again
            </button>
            <button
              className="flex-none w-16 p-2 bg-blue-500 text-white border-r border-solid border-blue-400"
              onClick={() => answerEntryAndReset("HARD")}
            >
              Hard
            </button>
            <button
              className="flex-none w-16 p-2 bg-blue-500 text-white border-r border-solid border-blue-400"
              onClick={() => answerEntryAndReset("GOOD")}
            >
              Good
            </button>
            <button
              className="flex-none w-16 p-2 bg-blue-500 text-white"
              onClick={() => answerEntryAndReset("EASY")}
            >
              Easy
            </button>
          </div>
        ) : (
          <button
            className="p-2 bg-blue-500 text-white shadow-md rounded"
            onClick={() => setIsAnswerShown(true)}
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  );
}
