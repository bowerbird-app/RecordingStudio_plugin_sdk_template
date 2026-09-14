import { parseHTML } from "linkedom";

export function installDom(): Document {
  const { window, document } = parseHTML("<!doctype html><html><body></body></html>");

  Object.defineProperty(globalThis, "window", { value: window, configurable: true });
  Object.defineProperty(globalThis, "document", { value: document, configurable: true });
  Object.defineProperty(globalThis, "HTMLElement", { value: window.HTMLElement, configurable: true });
  Object.defineProperty(globalThis, "Node", { value: window.Node, configurable: true });
  Object.defineProperty(globalThis, "DOMParser", { value: window.DOMParser, configurable: true });

  return document;
}

export function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schema_version: 1,
    html: "<p>Hello from the fixture.</p>",
    configuration: {},
    sdk: { minimum_version: "0.3.0" },
    ...overrides
  };
}
