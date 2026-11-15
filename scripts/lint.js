// Lint every HTML, CSS, JS and Markdown file in the repo. No dependencies.
// Run: npm run lint   (or: npm run lint:fix to fix what can be fixed)
//
// Files come from git, so anything gitignored (node_modules/, scratch files)
// is skipped the same way for every linter: tracked files plus new files that
// aren't ignored yet.

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const BIN = path.join(ROOT, "node_modules", ".bin");
const fix = process.argv.includes("--fix");

// Each linter, the files it checks and the flag that makes it fix them.
// html-validate can't fix, so it has none.
const LINTERS = [
  { name: "eslint", bin: "eslint", ext: [".js", ".mjs"], fixFlag: "--fix" },
  { name: "stylelint", bin: "stylelint", ext: [".css"], fixFlag: "--fix" },
  { name: "html-validate", bin: "html-validate", ext: [".html"] },
  { name: "markdownlint", bin: "markdownlint-cli2", ext: [".md"], fixFlag: "--fix" },
];

if (!fs.existsSync(BIN)) {
  console.error("Linters aren't installed: run npm install");
  process.exit(1);
}

const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  cwd: ROOT,
  encoding: "utf8",
});
if (listed.status !== 0) {
  console.error(listed.stderr);
  process.exit(1);
}
// Skip files deleted from the working tree but still in the index, and
// symlinks (CLAUDE.md points at AGENTS.md), so nothing is linted twice.
const files = listed.stdout.split("\0").filter((f) => {
  if (!f) return false;
  try {
    return !fs.lstatSync(path.join(ROOT, f)).isSymbolicLink();
  } catch {
    return false;
  }
});

let failed = false;
for (const linter of LINTERS) {
  const group = files.filter((f) => linter.ext.includes(path.extname(f)));
  if (group.length === 0) continue;
  const args = [...(fix && linter.fixFlag ? [linter.fixFlag] : []), ...group];
  const result = spawnSync(path.join(BIN, linter.bin), args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`✗ ${linter.name} failed`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
