function stripUnsafe(root: Element): void {
  root.querySelectorAll("script").forEach((element) => {
    element.remove();
  });

  const nodes = [root, ...root.querySelectorAll("*")];
  for (const element of nodes) {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if ((name === "href" || name === "src") && /^\s*javascript:/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }
  }
}

export function sanitizeHtml(html: string, documentRef: Document): DocumentFragment {
  const view = documentRef.defaultView;
  if (!view) {
    throw new Error("Document is not attached to a window.");
  }

  const parser = new view.DOMParser();
  const parsed = parser.parseFromString(`<div id="rs-sanitize-root">${html}</div>`, "text/html");
  const container = parsed.getElementById("rs-sanitize-root");
  const fragment = documentRef.createDocumentFragment();

  if (!container) {
    return fragment;
  }

  stripUnsafe(container);

  for (const child of [...container.childNodes]) {
    fragment.appendChild(documentRef.importNode(child, true));
  }

  return fragment;
}

export function fragmentIsEmpty(fragment: DocumentFragment): boolean {
  if (!fragment.hasChildNodes()) {
    return true;
  }

  return [...fragment.childNodes].every((node) => {
    return node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
  });
}
