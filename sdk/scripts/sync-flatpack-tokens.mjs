#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function candidates() {
  const list = [];
  if (process.env.FLATPACK_VARIABLES_CSS) {
    list.push(process.env.FLATPACK_VARIABLES_CSS);
  }
  try {
    const gemPath = execSync("bash -lc 'cd test/dummy && bundle show flat_pack'", {
      cwd: repoRoot,
      encoding: "utf8"
    }).trim();
    list.push(path.join(gemPath, "app/assets/stylesheets/flat_pack/variables.css"));
  } catch {
    // ignore
  }
  list.push(
    "/usr/local/lib/ruby/gems/3.3.0/bundler/gems/flatpack-ac45389d5f20/app/assets/stylesheets/flat_pack/variables.css"
  );
  return list;
}

let srcPath = null;
let text = null;
for (const candidate of candidates()) {
  try {
    text = await readFile(candidate, "utf8");
    srcPath = candidate;
    break;
  } catch {
    // next
  }
}

if (!text || !srcPath) {
  console.error("Could not find Flatpack variables.css");
  process.exit(1);
}

const start = text.indexOf(":root {");
if (start < 0) {
  console.error(`No :root block in ${srcPath}`);
  process.exit(1);
}

let depth = 0;
let end = null;
for (let i = start; i < text.length; i += 1) {
  if (text[i] === "{") depth += 1;
  else if (text[i] === "}") {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}

if (end == null) {
  console.error("Unclosed :root block");
  process.exit(1);
}

const block = text.slice(start, end);
const inner = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
const outPath = path.join(repoRoot, "sdk/src/css/flatpack-tokens.css");
const banner = `/* Generated from Flatpack ${path.basename(srcPath)} :root — npm run sync:tokens */\n`;
await writeFile(outPath, `${banner}.rs-widget {\n${inner}\n}\n`);
console.log(`Synced tokens from ${srcPath}`);
