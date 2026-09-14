import { meetsMinimum } from "./compareSemver";
import { parsePayload } from "./parsePayload";
import { deleteInstance, getInstance, setInstance } from "./registry";
import { clearWidget, ensureWidgetRoot, renderHtml, renderState } from "./render";
import type { WidgetHandle, WidgetState } from "./types";
import { SDK_VERSION } from "./version";

export class WidgetInstance {
  readonly element: HTMLElement;
  readonly root: HTMLElement;
  state: WidgetState = "loading";

  constructor(element: HTMLElement) {
    this.element = element;
    this.root = ensureWidgetRoot(element);
  }

  apply(payload: unknown): void {
    this.state = "loading";
    renderState(this.root, "loading");

    const parsed = parsePayload(payload);
    if (!parsed.ok) {
      this.state = "error";
      renderState(this.root, "error");
      return;
    }

    if (!meetsMinimum(SDK_VERSION, parsed.payload.sdk.minimum_version)) {
      this.state = "incompatible_version";
      renderState(this.root, "incompatible_version");
      return;
    }

    this.state = renderHtml(this.root, parsed.payload.html);
  }

  destroy(): void {
    clearWidget(this.root);
    if (this.root !== this.element) {
      this.root.remove();
    }
    deleteInstance(this.element);
  }
}

function requireElement(element: HTMLElement): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("An HTMLElement is required.");
  }
  return element;
}

export function mount(element: HTMLElement, payload: unknown): WidgetHandle {
  const host = requireElement(element);
  const existing = getInstance(host);
  if (existing) {
    existing.apply(payload);
    return handleFor(existing);
  }

  const instance = new WidgetInstance(host);
  setInstance(host, instance);
  instance.apply(payload);
  return handleFor(instance);
}

export function refresh(element: HTMLElement, payload: unknown): void {
  const host = requireElement(element);
  const existing = getInstance(host);
  if (existing) {
    existing.apply(payload);
    return;
  }

  mount(host, payload);
}

export function destroy(element: HTMLElement): void {
  const host = requireElement(element);
  getInstance(host)?.destroy();
}

function handleFor(instance: WidgetInstance): WidgetHandle {
  return {
    refresh(payload: unknown) {
      instance.apply(payload);
    },
    destroy() {
      instance.destroy();
    },
  };
}
