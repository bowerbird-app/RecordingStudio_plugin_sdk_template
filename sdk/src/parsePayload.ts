import { parseSemver } from "./compareSemver";
import { SCHEMA_VERSION, type ParseResult, type WidgetPayloadV1 } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(message: string): ParseResult {
  return { ok: false, reason: "invalid_payload", message };
}

export function parsePayload(input: unknown): ParseResult {
  if (!isPlainObject(input)) {
    return invalid("Payload must be an object.");
  }

  if (!("schema_version" in input)) {
    return invalid("schema_version is required.");
  }

  if (typeof input.schema_version !== "number" || !Number.isInteger(input.schema_version)) {
    return invalid("schema_version must be an integer.");
  }

  if (input.schema_version !== SCHEMA_VERSION) {
    return {
      ok: false,
      reason: "unknown_schema_version",
      message: `Unsupported schema_version ${input.schema_version}.`,
    };
  }

  if (typeof input.html !== "string") {
    return invalid("html must be a string.");
  }

  if (!isPlainObject(input.configuration)) {
    return invalid("configuration must be an object.");
  }

  if (!isPlainObject(input.sdk)) {
    return invalid("sdk must be an object.");
  }

  if (typeof input.sdk.minimum_version !== "string") {
    return invalid("sdk.minimum_version must be a string.");
  }

  if (!parseSemver(input.sdk.minimum_version)) {
    return invalid("sdk.minimum_version must be a major.minor.patch version.");
  }

  const payload: WidgetPayloadV1 = {
    schema_version: SCHEMA_VERSION,
    html: input.html,
    configuration: input.configuration,
    sdk: {
      minimum_version: input.sdk.minimum_version,
    },
  };

  return { ok: true, payload };
}
