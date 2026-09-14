import type { WidgetState } from "./types";
import { fragmentIsEmpty, sanitizeHtml } from "./sanitizeHtml";

export function ensureWidgetRoot(element: HTMLElement): HTMLElement {
  if (element.classList.contains("rs-widget")) {
    return element;
  }

  const existing = element.querySelector(":scope > .rs-widget");
  if (existing instanceof HTMLElement) {
    return existing;
  }

  const root = element.ownerDocument.createElement("div");
  root.className = "rs-widget";
  element.appendChild(root);
  return root;
}

function statusCopy(state: Exclude<WidgetState, "ready">): string {
  switch (state) {
    case "loading":
      return "One moment.";
    case "empty":
      return "Nothing to show yet.";
    case "error":
      return "This widget could not load.";
    case "incompatible_version":
      return "This widget needs a newer plugin SDK.";
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export function renderState(root: HTMLElement, state: Exclude<WidgetState, "ready">): void {
  root.dataset.rsState = state;
  root.replaceChildren();
  const status = root.ownerDocument.createElement("p");
  status.className = "rs-widget__status";
  status.textContent = statusCopy(state);
  root.appendChild(status);
}

export function renderHtml(root: HTMLElement, html: string): "ready" | "empty" {
  const fragment = sanitizeHtml(html, root.ownerDocument);
  if (fragmentIsEmpty(fragment)) {
    renderState(root, "empty");
    return "empty";
  }

  root.dataset.rsState = "ready";
  root.replaceChildren(fragment);
  return "ready";
}

export function clearWidget(root: HTMLElement): void {
  delete root.dataset.rsState;
  root.replaceChildren();
}
