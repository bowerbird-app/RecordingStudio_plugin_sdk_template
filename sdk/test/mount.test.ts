import assert from "node:assert/strict";
import { test } from "node:test";
import { destroy, mount, refresh } from "../src/instance.ts";
import { getInstance } from "../src/registry.ts";
import { installDom, validPayload } from "./dom.ts";

test("mount renders ready html under .rs-widget", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";
  document.body.append(host);

  mount(host, validPayload());

  assert.equal(host.dataset.rsState, "ready");
  assert.equal(host.querySelector("p")?.textContent, "Hello from the fixture.");
});

test("mount goes empty when sanitized html has nothing left", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(host, validPayload({ html: "   " }));

  assert.equal(host.dataset.rsState, "empty");
  assert.equal(host.textContent, "Nothing to show yet.");
});

test("mount goes to error for an invalid payload", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(host, { html: "<p>nope</p>" });

  assert.equal(host.dataset.rsState, "error");
  assert.equal(host.textContent, "This widget could not load.");
});

test("mount goes to incompatible_version when the SDK is too old", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(
    host,
    validPayload({
      sdk: { minimum_version: "9.0.0" },
    })
  );

  assert.equal(host.dataset.rsState, "incompatible_version");
  assert.equal(host.textContent, "This widget needs a newer plugin SDK.");
});

test("refresh replaces html in the same root", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  mount(host, validPayload());
  refresh(host, validPayload({ html: "<strong>Updated</strong>" }));

  assert.equal(host.dataset.rsState, "ready");
  assert.equal(host.querySelector("strong")?.textContent, "Updated");
  assert.equal(host.querySelectorAll("p").length, 0);
});

test("destroy tears down the instance and a second destroy is a no-op", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";
  document.body.append(host);

  mount(host, validPayload());
  destroy(host);
  destroy(host);

  assert.equal(getInstance(host), undefined);
  assert.equal(host.dataset.rsState, undefined);
  assert.equal(host.childNodes.length, 0);
});

test("handle refresh and destroy use the same instance", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  const handle = mount(host, validPayload());
  handle.refresh(validPayload({ html: "<em>Again</em>" }));
  assert.equal(host.querySelector("em")?.textContent, "Again");

  handle.destroy();
  assert.equal(getInstance(host), undefined);
});

test("refresh on an unmounted element mounts it", () => {
  installDom();
  const host = document.createElement("div");
  host.className = "rs-widget";

  refresh(host, validPayload());

  assert.equal(host.dataset.rsState, "ready");
  assert.equal(host.querySelector("p")?.textContent, "Hello from the fixture.");
});
