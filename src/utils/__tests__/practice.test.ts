import { describe, expect, it, jest } from "@jest/globals";
import * as assert from "assert/strict";
import { PracticeSystem } from "../practice";
import { BookmarkEntry } from "../types";

// >>> import datetime
// >>> t = datetime.datetime.now(tz=datetime.timezone.utc)
// >>> t, t.timestamp()
// (datetime.datetime(2022, 2, 6, 4, 18, 23, 654075, tzinfo=datetime.timezone.utc), 1644121103.654075)
const DATE = new Date(1644121103 * 1000);

jest.useFakeTimers();
jest.setSystemTime(DATE);

describe("practice/PracticeSystem", () => {
  describe("basic", () => {
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
            "practiceEntryId": "0x163bcb4b33ce694b",
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
                "practiceEntryId": "0x163bcb4b33ce694b",
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
                "practiceEntryId": "0x163bcb4b33ce694b",
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
                      "practiceEntryId": "0x163bcb4b33ce694b",
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
          "lastAnsweredAt": 1970-01-01T00:00:00.000Z,
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
                  "practiceEntryId": "0x163bcb4b33ce694b",
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
});
