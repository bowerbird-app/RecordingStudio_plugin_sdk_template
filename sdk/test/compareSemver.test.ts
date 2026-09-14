import assert from "node:assert/strict";
import { test } from "node:test";
import { compareSemver, meetsMinimum, parseSemver } from "../src/compareSemver.ts";

test("parses a major.minor.patch version", () => {
  assert.deepEqual(parseSemver("0.3.0"), { major: 0, minor: 3, patch: 0 });
  assert.equal(parseSemver("1.0"), null);
  assert.equal(parseSemver("v0.3.0"), null);
});

test("orders versions by major, then minor, then patch", () => {
  assert.ok((compareSemver("0.3.0", "0.2.9") ?? 0) > 0);
  assert.ok((compareSemver("0.3.0", "1.0.0") ?? 0) < 0);
  assert.equal(compareSemver("0.3.0", "0.3.0"), 0);
  assert.equal(compareSemver("0.3.0", "v0.3.0"), null);
});

test("meetsMinimum is true when the SDK version is at or above the floor", () => {
  assert.equal(meetsMinimum("0.3.0", "0.2.0"), true);
  assert.equal(meetsMinimum("0.3.0", "0.3.0"), true);
  assert.equal(meetsMinimum("0.3.0", "0.4.0"), false);
  assert.equal(meetsMinimum("0.3.0", "1.0.0"), false);
});
