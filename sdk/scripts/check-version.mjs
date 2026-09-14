#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const pkg = JSON.parse(await readFile(path.join(repoRoot, "sdk/package.json"), "utf8"));
const versionRb = await readFile(
  path.join(repoRoot, "lib/recording_studio_plugin_sdk_template/version.rb"),
  "utf8"
);
const match = versionRb.match(/VERSION\s*=\s*"([^"]+)"/);
if (!match) {
  console.error("Could not parse gem VERSION");
  process.exit(1);
}
const gemVersion = match[1];
if (pkg.version !== gemVersion) {
  console.error(`Version mismatch: package.json=${pkg.version} gem=${gemVersion}`);
  process.exit(1);
}
const srcVersion = await readFile(path.join(repoRoot, "sdk/src/version.ts"), "utf8");
if (!srcVersion.includes(`"${gemVersion}"`)) {
  console.error(`sdk/src/version.ts does not contain ${gemVersion}`);
  process.exit(1);
}
console.log(`Versions aligned at ${gemVersion}`);
