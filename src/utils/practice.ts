import superjson from "superjson";
import * as assert from "./assert";
import { deepcopy } from "./copy";
import { Timedelta, TimedeltaOptions } from "./datetime";
import { entriesV2 as getEntries } from "./lodash-extra";
import { Rng } from "./rng";
import { BookmarkEntry, PracticeEntryId } from "./types";

// References
// - https://docs.ankiweb.net/studying.html
// - https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html
// - https://github.com/ankitects/anki/blob/main/pylib/anki/scheduler
// - https://github.com/ankitects/anki/tree/main/rslib/src/scheduler

export type AnswerType = "AGAIN" | "HARD" | "GOOD" | "EASY";
export type QueueType = "NEW" | "LEARN" | "REVIEW";

export interface PracticeEntry {
  id: PracticeEntryId;
  bookmark: BookmarkEntry;
  createdAt: Date;
  // TODO: restructure mutable state
  schedules: Date[];
  answers: PracticeAnswer[];
  easeFactor: number;
}

export interface PracticeAnswer {
  type: AnswerType;
  createdAt: Date;
}

interface PracticeOptions {
  newEntriesPerDay: number;
  reviewsPerDay: number;
  easeMultiplier: number;
  easeBonus: number;
}

const DEFAULT_PRACTICE_OPTIONS: PracticeOptions = {
  newEntriesPerDay: 50,
  reviewsPerDay: 200,
  easeMultiplier: 2,
  easeBonus: 1.5,
};

const DEFAULT_PRACTICE_QUEUES: Record<QueueType, PracticeEntry[]> = {
  NEW: [],
  LEARN: [],
  REVIEW: [],
};

const DEFAULT_PRACTICE_COUNTS: Record<QueueType, number> = {
  NEW: 0,
  LEARN: 0,
  REVIEW: 0,
};

type QueuePosition = {
  type: QueueType;
  index: number;
};

const QUEUE_RULES: Record<QueueType, Record<AnswerType, QueueType>> = {
  NEW: {
    AGAIN: "LEARN",
    HARD: "LEARN",
    GOOD: "LEARN",
    EASY: "REVIEW",
  },
  LEARN: {
    AGAIN: "LEARN",
    HARD: "LEARN",
    GOOD: "REVIEW",
    EASY: "REVIEW",
  },
  REVIEW: {
    AGAIN: "LEARN",
    HARD: "REVIEW",
    GOOD: "REVIEW",
    EASY: "REVIEW",
  },
};

const SCHEDULE_RULES: Record<
  QueueType,
  Record<AnswerType, TimedeltaOptions>
> = {
  NEW: {
    AGAIN: { minutes: 1 },
    HARD: { minutes: 5 },
    GOOD: { days: 1 },
    EASY: { days: 1 },
  },
  LEARN: {
    AGAIN: { minutes: 1 },
    HARD: { minutes: 5 },
    GOOD: { days: 1 },
    EASY: { days: 1 },
  },
  REVIEW: {
    AGAIN: { minutes: 10 },
    HARD: { hours: 1 },
    GOOD: { days: 1 },
    EASY: { days: 1 },
  },
};

export class PracticeSystem {
  private rng = new Rng();
  queues: Record<QueueType, PracticeEntry[]> = deepcopy(
    DEFAULT_PRACTICE_QUEUES
  );
  counts: Record<QueueType, number> = deepcopy(DEFAULT_PRACTICE_COUNTS);
  options: PracticeOptions = DEFAULT_PRACTICE_OPTIONS;

  serialize(): any {
    return superjson.serialize({
      data: this,
    });
  }

  static deserialize(serialized: any): PracticeSystem {
    const {
      data: { queues, counts, options },
    } = superjson.deserialize<{ data: PracticeSystem }>(serialized);
    const result = new PracticeSystem();
    result.queues = queues;
    result.counts = counts;
    result.options = options;
    return result;
  }

  resetCounts(): void {
    this.counts = deepcopy(DEFAULT_PRACTICE_COUNTS);
  }

  getNextEntry(now: Date = new Date()): PracticeEntry | undefined {
    if (
      this.counts.NEW < this.options.newEntriesPerDay &&
      this.queues.NEW.length > 0
    ) {
      return this.queues.NEW[0];
    }
    if (
      this.queues.LEARN.length > 0 &&
      this.queues.REVIEW[0].schedules[0] <= now
    ) {
      return this.queues.LEARN[0];
    }
    if (
      this.counts.REVIEW < this.options.reviewsPerDay &&
      this.queues.REVIEW.length > 0 &&
      this.queues.REVIEW[0].schedules[0] <= now
    ) {
      return this.queues.REVIEW[0];
    }
    return;
  }

  answerEntry(
    entry: PracticeEntry /* mutate */,
    type: AnswerType,
    now: Date = new Date()
  ): void {
    const preQueueType = this.deleteEntry(entry);
    this.counts[preQueueType]++;
    this.scheduleEntry(entry, preQueueType, { type, createdAt: now });
  }

  addNewEntry(
    bookmark: BookmarkEntry /* mutate */,
    now: Date = new Date()
  ): PracticeEntry {
    const entry = {
      id: this.rng.id(now.getTime()),
      bookmark: bookmark,
      createdAt: now,
      schedules: [],
      answers: [],
      easeFactor: 1,
    };
    assert.ok(typeof bookmark.practiceEntryId === "undefined");
    bookmark.practiceEntryId = entry.id;
    this.insertEntry(entry, "NEW");
    return entry;
  }

  private scheduleEntry(
    entry: PracticeEntry /* mutate */,
    preQueueType: QueueType,
    answer: PracticeAnswer
  ): void {
    const postQueueType = QUEUE_RULES[preQueueType][answer.type];
    let delta = Timedelta.make(SCHEDULE_RULES[preQueueType][answer.type]);

    // TODO: schedule based on `last(entry.answers).createdAt`
    if (preQueueType === "REVIEW") {
      delta = delta.mul(entry.easeFactor);
    }

    // Update `easeFactor`
    if (postQueueType === "REVIEW") {
      entry.easeFactor *= this.options.easeMultiplier;
      if (answer.type === "EASY") {
        entry.easeFactor *= this.options.easeBonus;
      }
    }

    if (answer.type === "AGAIN") {
      entry.easeFactor = 1;
    }

    entry.answers.unshift(answer);
    entry.schedules.unshift(delta.radd(answer.createdAt));
    this.insertEntry(entry, postQueueType);
  }

  private insertEntry(entry: PracticeEntry, queueType: QueueType): void {
    const queue = this.queues[queueType];
    if (queueType === "NEW") {
      queue.push(entry);
    } else {
      assert.ok(entry.schedules.length > 0);
      const index = queue.findIndex((other) => {
        assert.ok(other.schedules.length > 0);
        return entry.schedules[0] < other.schedules[0];
      });
      queue.splice(index, 0, entry);
    }
  }

  private deleteEntry(entry: PracticeEntry): QueueType {
    const position = this.findPosition(entry);
    assert.ok(position);
    this.queues[position.type].splice(position.index, 1);
    return position.type;
  }

  private findPosition(entry: PracticeEntry): QueuePosition | undefined {
    for (const { k: type, v: entries } of getEntries(this.queues)) {
      const index = entries.findIndex((other) => entry.id === other.id);
      if (index !== -1) {
        return { type, index };
      }
    }
    return;
  }

  // TODO: Check the invariance (queue elements order etc...)
  validate(): void {}

  // TODO: Update to satify the invariance
  fix(): void {}
}

superjson.registerClass(PracticeSystem, {
  allowProps: ["queues", "counts", "options"],
});
