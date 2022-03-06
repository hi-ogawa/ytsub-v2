import * as assert from "assert/strict";
import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { PracticeSystem } from "../practice";
import { BookmarkEntry } from "../types";

// >>> import datetime
// >>> t = datetime.datetime.now(tz=datetime.timezone.utc)
// >>> t, t.timestamp()
// (datetime.datetime(2022, 2, 6, 4, 18, 23, 654075, tzinfo=datetime.timezone.utc), 1644121103.654075)
const DATE = new Date(1644121103 * 1000);

describe("practice/PracticeSystem", () => {
  describe("basic", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(DATE);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("works", () => {
      const system = new PracticeSystem();

      const bookmarkEntry: BookmarkEntry = {
        watchParameters: {} as any,
        captionEntry: {} as any,
        bookmarkText: "hello",
      };

      // Add new entry
      const newEntry = system.addNewEntry(bookmarkEntry);
      expect(newEntry).toMatchInlineSnapshot(`
        Object {
          "answers": Array [],
          "bookmark": Object {
            "bookmarkText": "hello",
            "captionEntry": Object {},
            "watchParameters": Object {},
          },
          "createdAt": 2022-02-06T04:18:23.000Z,
          "easeFactor": 1,
          "id": "0x163bcb4b33ce694b",
          "schedules": Array [],
        }
      `);
      expect(system.queues).toMatchInlineSnapshot(`
        Object {
          "LEARN": Array [],
          "NEW": Array [
            Object {
              "answers": Array [],
              "bookmark": Object {
                "bookmarkText": "hello",
                "captionEntry": Object {},
                "watchParameters": Object {},
              },
              "createdAt": 2022-02-06T04:18:23.000Z,
              "easeFactor": 1,
              "id": "0x163bcb4b33ce694b",
              "schedules": Array [],
            },
          ],
          "REVIEW": Array [],
        }
      `);
      expect(system.counts).toMatchInlineSnapshot(`
        Object {
          "LEARN": 0,
          "NEW": 0,
          "REVIEW": 0,
        }
      `);

      // Get next entry to practice
      const practiceEntry = system.getNextEntry();
      expect(practiceEntry).toEqual(newEntry);
      assert.ok(practiceEntry);

      // Answer
      system.answerEntry(practiceEntry, "GOOD");
      expect(system.queues).toMatchInlineSnapshot(`
        Object {
          "LEARN": Array [
            Object {
              "answers": Array [
                Object {
                  "createdAt": 2022-02-06T04:18:23.000Z,
                  "type": "GOOD",
                },
              ],
              "bookmark": Object {
                "bookmarkText": "hello",
                "captionEntry": Object {},
                "watchParameters": Object {},
              },
              "createdAt": 2022-02-06T04:18:23.000Z,
              "easeFactor": 1,
              "id": "0x163bcb4b33ce694b",
              "schedules": Array [
                2022-02-07T04:18:23.000Z,
              ],
            },
          ],
          "NEW": Array [],
          "REVIEW": Array [],
        }
      `);
      expect(system.counts).toMatchInlineSnapshot(`
        Object {
          "LEARN": 0,
          "NEW": 1,
          "REVIEW": 0,
        }
      `);

      // Serialize/deserialize
      const serialized = system.serialize();
      expect(serialized).toMatchInlineSnapshot(`
        Object {
          "json": Object {
            "data": Object {
              "counts": Object {
                "LEARN": 0,
                "NEW": 1,
                "REVIEW": 0,
              },
              "lastAnsweredAt": "2022-02-06T04:18:23.000Z",
              "options": Object {
                "easeBonus": 1.5,
                "easeMultiplier": 2,
                "newEntriesPerDay": 50,
                "reviewsPerDay": 200,
              },
              "queues": Object {
                "LEARN": Array [
                  Object {
                    "answers": Array [
                      Object {
                        "createdAt": "2022-02-06T04:18:23.000Z",
                        "type": "GOOD",
                      },
                    ],
                    "bookmark": Object {
                      "bookmarkText": "hello",
                      "captionEntry": Object {},
                      "watchParameters": Object {},
                    },
                    "createdAt": "2022-02-06T04:18:23.000Z",
                    "easeFactor": 1,
                    "id": "0x163bcb4b33ce694b",
                    "schedules": Array [
                      "2022-02-07T04:18:23.000Z",
                    ],
                  },
                ],
                "NEW": Array [],
                "REVIEW": Array [],
              },
            },
          },
          "meta": Object {
            "values": Object {
              "data": Array [
                Array [
                  "class",
                  "PracticeSystem",
                ],
                Object {
                  "lastAnsweredAt": Array [
                    "Date",
                  ],
                  "queues.LEARN.0.answers.0.createdAt": Array [
                    "Date",
                  ],
                  "queues.LEARN.0.createdAt": Array [
                    "Date",
                  ],
                  "queues.LEARN.0.schedules.0": Array [
                    "Date",
                  ],
                },
              ],
            },
          },
        }
      `);

      expect(PracticeSystem.deserialize(serialized)).toMatchInlineSnapshot(`
        PracticeSystem {
          "counts": Object {
            "LEARN": 0,
            "NEW": 1,
            "REVIEW": 0,
          },
          "lastAnsweredAt": 2022-02-06T04:18:23.000Z,
          "options": Object {
            "easeBonus": 1.5,
            "easeMultiplier": 2,
            "newEntriesPerDay": 50,
            "reviewsPerDay": 200,
          },
          "queues": Object {
            "LEARN": Array [
              Object {
                "answers": Array [
                  Object {
                    "createdAt": 2022-02-06T04:18:23.000Z,
                    "type": "GOOD",
                  },
                ],
                "bookmark": Object {
                  "bookmarkText": "hello",
                  "captionEntry": Object {},
                  "watchParameters": Object {},
                },
                "createdAt": 2022-02-06T04:18:23.000Z,
                "easeFactor": 1,
                "id": "0x163bcb4b33ce694b",
                "schedules": Array [
                  2022-02-07T04:18:23.000Z,
                ],
              },
            ],
            "NEW": Array [],
            "REVIEW": Array [],
          },
          "rng": Rng {
            "seed": 1,
          },
        }
      `);
    });
  });

  describe("insertEntry", () => {
    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(DATE);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("works", () => {
      const system = new PracticeSystem();

      const b1: BookmarkEntry = {
        watchParameters: {} as any,
        captionEntry: {} as any,
        bookmarkText: "hello",
      };
      const b2: BookmarkEntry = {
        watchParameters: {} as any,
        captionEntry: {} as any,
        bookmarkText: "hey",
      };

      const p1 = system.addNewEntry(b1);
      const p2 = system.addNewEntry(b2);

      jest.setSystemTime(DATE.getTime() + 60 * 1000);
      system.answerEntry(p1, "GOOD");

      jest.setSystemTime(DATE.getTime() + 120 * 1000);
      system.answerEntry(p2, "GOOD");

      const [l1, l2] = system.queues.LEARN;
      expect(l1.id).toBe(p1.id);
      expect(l2.id).toBe(p2.id);
    });
  });
});
