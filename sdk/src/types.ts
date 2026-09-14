export const SCHEMA_VERSION = 1 as const;

export type WidgetState =
  | "loading"
  | "ready"
  | "empty"
  | "error"
  | "incompatible_version";

export type WidgetPayloadV1 = {
  schema_version: 1;
  html: string;
  configuration: Record<string, unknown>;
  sdk: {
    minimum_version: string;
  };
};

export type ParseFailureReason = "invalid_payload" | "unknown_schema_version";

export type ParseError = {
  ok: false;
  reason: ParseFailureReason;
  message: string;
};

export type ParseSuccess = {
  ok: true;
  payload: WidgetPayloadV1;
};

export type ParseResult = ParseSuccess | ParseError;

export type WidgetHandle = {
  refresh(payload: unknown): void;
  destroy(): void;
};
