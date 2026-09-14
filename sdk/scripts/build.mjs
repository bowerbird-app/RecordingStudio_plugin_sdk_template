#!/usr/bin/env node
import * as esbuild from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const repoRoot = path.resolve(root, "..");
const distDir = path.join(repoRoot, "dist");
const entry = path.join(root, "src", "index.ts");

await mkdir(distDir, { recursive: true });

await esbuild.build({
  entryPoints: [entry],
  outfile: path.join(distDir, "recording-studio-plugin-sdk.esm.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  minify: false,
  sourcemap: false,
  legalComments: "none"
});

await esbuild.build({
  entryPoints: [entry],
  outfile: path.join(distDir, "recording-studio-plugin-sdk.js"),
  bundle: true,
  format: "iife",
  globalName: "RecordingStudioPluginSdk",
  platform: "browser",
  target: ["es2020"],
  minify: false,
  sourcemap: false,
  legalComments: "none"
});

const tokens = await readFile(path.join(root, "src/css/flatpack-tokens.css"), "utf8");
const widget = await readFile(path.join(root, "src/css/entry.css"), "utf8");
await writeFile(
  path.join(distDir, "recording-studio-plugin-sdk.css"),
  `${tokens.trim()}\n\n${widget.trim()}\n`
);


const dummySdk = path.join(repoRoot, "test/dummy/public/sdk");
await mkdir(dummySdk, { recursive: true });
for (const name of [
  "recording-studio-plugin-sdk.esm.js",
  "recording-studio-plugin-sdk.js",
  "recording-studio-plugin-sdk.css"
]) {
  await writeFile(path.join(dummySdk, name), await readFile(path.join(distDir, name)));
}
console.log("Built dist/ and copied artifacts to test/dummy/public/sdk/");

