import assert from "node:assert/strict";
import { test } from "node:test";
import { mount } from "../src/instance.ts";
import { installDom, validPayload } from "./dom.ts";

test("strips script tags from payload html", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(
    host,
    validPayload({
      html: "<p>Safe</p><script>window.__ran = true</script>",
    })
  );

  assert.equal(host.dataset.rsState, "ready");
  assert.equal(host.querySelector("script"), null);
  assert.equal(host.querySelector("p")?.textContent, "Safe");
  assert.equal(Object.hasOwn(window, "__ran"), false);
});

test("strips on* attributes from payload html", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(
    host,
    validPayload({
      html: '<button onclick="window.__clicked = true">Press</button>',
    })
  );

  const button = host.querySelector("button");
  assert.ok(button);
  assert.equal(button.getAttribute("onclick"), null);
  assert.equal(button.textContent, "Press");
});

test("payload-only scripts leave the widget empty", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(host, validPayload({ html: "<script>alert(1)</script>" }));

  assert.equal(host.dataset.rsState, "empty");
  assert.equal(host.textContent, "Nothing to show yet.");
});

test("strips javascript: href and src", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(
    host,
    validPayload({
      html: '<a href="javascript:alert(1)">Link</a><img src="javascript:alert(1)" alt="x">',
    })
  );

  const link = host.querySelector("a");
  const image = host.querySelector("img");
  assert.ok(link);
  assert.ok(image);
  assert.equal(link.getAttribute("href"), null);
  assert.equal(image.getAttribute("src"), null);
  assert.equal(link.textContent, "Link");
});
