#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../../dist");

const required = [
  "recording-studio-plugin-sdk.esm.js",
  "recording-studio-plugin-sdk.js",
  "recording-studio-plugin-sdk.css"
];

for (const name of required) {
  const full = path.join(distDir, name);
  const info = await stat(full);
  if (!info.isFile() || info.size < 32) {
    console.error(`Missing or empty dist artifact: ${name}`);
    process.exit(1);
  }
}

const css = await readFile(path.join(distDir, "recording-studio-plugin-sdk.css"), "utf8");
if (!css.includes(".rs-widget")) {
  console.error("CSS does not contain .rs-widget");
  process.exit(1);
}
if (!css.includes("--") || css.length < 500) {
  console.error("CSS does not look like Flatpack tokens were inlined");
  process.exit(1);
}

const iife = await readFile(path.join(distDir, "recording-studio-plugin-sdk.js"), "utf8");
if (!iife.includes("RecordingStudioPluginSdk")) {
  console.error("IIFE build missing RecordingStudioPluginSdk global");
  process.exit(1);
}

console.log("dist artifacts ok");
