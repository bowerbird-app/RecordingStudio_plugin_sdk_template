#!/usr/bin/env node
/**
 * Sync Flatpack :root tokens into sdk/src/css/flatpack-tokens.css under .rs-widget.
 *
 * When Flatpack is unavailable (Node-only CI, missing Ruby/bundle), keep the
 * committed tokens file and exit 0 so `npm run build` still succeeds.
 */
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const outPath = path.join(repoRoot, "sdk/src/css/flatpack-tokens.css");

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
    // Node-only environments often have no bundle — fall through.
  }
  return list;
}

async function keepCommittedTokens(reason) {
  try {
    await access(outPath);
    console.warn(`${reason}; keeping committed sdk/src/css/flatpack-tokens.css`);
    process.exit(0);
  } catch {
    console.error(`${reason}; and no committed flatpack-tokens.css found`);
    process.exit(1);
  }
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
  await keepCommittedTokens("Could not find Flatpack variables.css");
}

const start = text.indexOf(":root {");
if (start < 0) {
  await keepCommittedTokens(`No :root block in ${srcPath}`);
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
  await keepCommittedTokens("Unclosed :root block");
}

const block = text.slice(start, end);
const inner = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
const banner = `/* Generated from Flatpack ${path.basename(srcPath)} :root — npm run sync:tokens */\n`;
await writeFile(outPath, `${banner}.rs-widget {\n${inner}\n}\n`);
console.log(`Synced tokens from ${srcPath}`);
