import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePayload } from "../src/parsePayload.ts";
import { validPayload } from "./dom.ts";

test("parses a schema_version 1 payload", () => {
  const result = parsePayload(validPayload());

  assert.deepEqual(result, {
    ok: true,
    payload: {
      schema_version: 1,
      html: "<p>Hello from the fixture.</p>",
      configuration: {},
      sdk: { minimum_version: "0.3.0" },
    },
  });
});

test("rejects an unknown schema version", () => {
  const result = parsePayload(validPayload({ schema_version: 2 }));

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.reason, "unknown_schema_version");
  assert.equal(result.message, "Unsupported schema_version 2.");
});

test("rejects a missing schema version", () => {
  const payload = validPayload();
  delete payload.schema_version;

  const result = parsePayload(payload);

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.reason, "invalid_payload");
  assert.equal(result.message, "schema_version is required.");
});

test("rejects a string schema version", () => {
  const result = parsePayload(validPayload({ schema_version: "1" }));

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.reason, "invalid_payload");
  assert.equal(result.message, "schema_version must be an integer.");
});

test("rejects null, arrays, and primitives", () => {
  for (const input of [null, [], "payload", 1]) {
    const result = parsePayload(input);
    assert.equal(result.ok, false);
    if (result.ok) {
      continue;
    }
    assert.equal(result.reason, "invalid_payload");
    assert.equal(result.message, "Payload must be an object.");
  }
});

test("rejects a configuration array", () => {
  const result = parsePayload(validPayload({ configuration: [] }));

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.reason, "invalid_payload");
  assert.equal(result.message, "configuration must be an object.");
});

test("rejects an invalid minimum version", () => {
  const result = parsePayload(
    validPayload({
      sdk: { minimum_version: "v1" },
    })
  );

  assert.equal(result.ok, false);
  if (result.ok) {
    return;
  }
  assert.equal(result.reason, "invalid_payload");
  assert.equal(result.message, "sdk.minimum_version must be a major.minor.patch version.");
});
