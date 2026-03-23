import { readFileSync, existsSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const base = __dirname;
const dryRun = process.argv.includes("-DryRun") || process.argv.includes("--dry-run");
const mapPath = join(base, "_rename_mapping.json");
const pairs = JSON.parse(readFileSync(mapPath, "utf8"));

function isGitRepo() {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
const useGit = isGitRepo();

let ok = 0, skip = 0, errs = [];
for (const [old, neu] of pairs) {
  const oldPath = join(base, old.replace(/\//g, "\\"));
  const parent = dirname(oldPath);
  const newPath = old.includes("/") || old.includes("\\")
    ? join(base, neu.replace(/\//g, "\\"))
    : join(parent, neu);
  if (!existsSync(oldPath)) {
    errs.push("Not found: " + old);
    continue;
  }
  if (oldPath === newPath) {
    skip++;
    continue;
  }
  if (existsSync(newPath)) {
    errs.push("Exists: " + neu);
    skip++;
    continue;
  }
  if (dryRun) {
    console.log("[DryRun]", old, "->", neu);
    ok++;
    continue;
  }
  try {
    if (useGit) {
      try {
        execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: "pipe" });
      } catch {
        renameSync(oldPath, newPath);
      }
    } else {
      renameSync(oldPath, newPath);
    }
    console.log("OK:", neu);
    ok++;
  } catch (e) {
    errs.push("Error: " + old + " - " + e.message);
  }
}
console.log("\nDone:", ok, "| Skipped:", skip);
errs.forEach((e) => console.error(e));
