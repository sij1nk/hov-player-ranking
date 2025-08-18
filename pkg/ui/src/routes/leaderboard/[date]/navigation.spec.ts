import { describe, expect, test } from "vitest";
import { back, back24Hours, forward, forward24Hours, latest, oldest } from "./navigation";
import util from "node:util";
import type { Snapshot } from "$lib/types";

const snapshot = (id: number, dateString: string): Snapshot => {
  const date = new Date(dateString);
  const dateShort = util.format(
    "%s-%s-%s-%s",
    date.getFullYear(),
    String(date.getMonth()).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
  );

  return { id, date, dateShort };
};

const snapshots = [
  snapshot(13, "2025-08-19T12:00:38"), // <-- latest
  snapshot(12, "2025-08-19T10:10:37"), // <-- 24h forward
  snapshot(11, "2025-08-19T07:12:28"),
  snapshot(10, "2025-08-19T04:00:05"),
  snapshot(9, "2025-08-18T11:04:03"),
  snapshot(8, "2025-08-18T10:03:33"), // <-- next
  snapshot(7, "2025-08-18T09:00:28"), // <-- current
  snapshot(6, "2025-08-18T08:02:41"), // <-- prev
  snapshot(5, "2025-08-18T07:03:51"),
  snapshot(4, "2025-08-17T12:01:28"),
  snapshot(3, "2025-08-17T10:03:14"),
  snapshot(2, "2025-08-17T08:58:45"), // <-- 24h back
  snapshot(1, "2025-08-17T08:02:32"),
  snapshot(0, "2025-08-17T05:01:21"), // <-- oldest
];

const current = snapshots.find((s) => s.id === 7)!;

describe("oldest", () => {
  test("works", () => {
    const found = oldest(current, snapshots);

    expect(found?.id).toBe(0);
  });

  test("returns null if current is the oldest", () => {
    const current = snapshots.at(-1)!;

    const found = oldest(current, snapshots);

    expect(found).toBeNull();
  });
});

describe("back24Hours", () => {
  test("works", () => {
    const found = back24Hours(current, snapshots);

    expect(found?.id).toBe(2);
  });

  test("returns null if current is the oldest", () => {
    const current = snapshots.at(-1)!;

    const found = back24Hours(current, snapshots);

    expect(found).toBeNull();
  });

  test("returns previous one if current is closest to -24h", () => {
    const snapshots = [snapshot(1, "2025-08-17T12:01:28"), snapshot(0, "2025-08-14T10:25:11")];

    const current = snapshots[0];

    const found = back24Hours(current, snapshots);

    expect(found?.id).toBe(0);
  });
});

describe("back", () => {
  test("works", () => {
    const found = back(current, snapshots);

    expect(found?.id).toBe(6);
  });

  test("returns null if current is the oldest", () => {
    const current = snapshots.at(-1)!;

    const found = back(current, snapshots);

    expect(found).toBeNull();
  });
});

describe("forward", () => {
  test("works", () => {
    const found = forward(current, snapshots);

    expect(found?.id).toBe(8);
  });

  test("returns null if current is the latest", () => {
    const current = snapshots[0];

    const found = forward(current, snapshots);

    expect(found).toBeNull();
  });
});

describe("forward24Hours", () => {
  test("works", () => {
    const found = forward24Hours(current, snapshots);

    expect(found?.id).toBe(12);
  });

  test("returns null if current is the latest", () => {
    const current = snapshots[0];

    const found = forward24Hours(current, snapshots);

    expect(found).toBeNull();
  });

  test("returns next one if current is closest to +24h", () => {
    const snapshots = [snapshot(1, "2025-08-17T12:01:28"), snapshot(0, "2025-08-14T10:25:11")];

    const current = snapshots[1];

    const found = forward24Hours(current, snapshots);

    expect(found?.id).toBe(1);
  });
});

describe("latest", () => {
  test("works", () => {
    const found = latest(current, snapshots);

    expect(found?.id).toBe(13);
  });

  test("returns null if current is the latest", () => {
    const current = snapshots[0];

    const found = latest(current, snapshots);

    expect(found).toBeNull();
  });
});
