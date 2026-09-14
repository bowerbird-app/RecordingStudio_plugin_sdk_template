import type { WidgetInstance } from "./instance";

const instances = new WeakMap<HTMLElement, WidgetInstance>();

export function getInstance(element: HTMLElement): WidgetInstance | undefined {
  return instances.get(element);
}

export function setInstance(element: HTMLElement, instance: WidgetInstance): void {
  instances.set(element, instance);
}

export function deleteInstance(element: HTMLElement): void {
  instances.delete(element);
}
