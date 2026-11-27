/**
 * Fails the build when a server secret reached the browser bundle.
 * process.env is inlined from an allowlist (vite.config.ts), so this only
 * trips if that list grows a secret or code reads one some other way.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CLIENT_DIR = path.resolve("build/client");
const SECRET_NAMES = ["KYC_REGISTRAR_PRIVATE_KEY"];
// A full Ed25519 secret key; the bare "edsk" prefix is in taquito's own code
const SECRET_KEY_PATTERN = /edsk[1-9A-HJ-NP-Za-km-z]{50,}/;
const TEXT_FILE = /\.(js|mjs|css|html|json|map|txt|webmanifest)$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) yield* walk(entryPath);
    else if (TEXT_FILE.test(entry.name)) yield entryPath;
  }
}

const secretValues = SECRET_NAMES.map((name) =>
  process.env[name]?.trim()
).filter(Boolean);
const leaks = [];

for await (const file of walk(CLIENT_DIR)) {
  const text = await readFile(file, "utf8");
  const relative = path.relative(process.cwd(), file);

  for (const name of SECRET_NAMES) {
    if (text.includes(name)) leaks.push(`${relative}: mentions ${name}`);
  }
  if (secretValues.some((value) => text.includes(value))) {
    leaks.push(`${relative}: contains a secret value`);
  }
  if (SECRET_KEY_PATTERN.test(text)) {
    leaks.push(`${relative}: contains an edsk… secret key`);
  }
}

if (leaks.length > 0) {
  console.error("Server secrets found in the client bundle:");
  for (const leak of leaks) console.error(`  ${leak}`);
  process.exit(1);
}

console.log("Client bundle: no server secrets found.");
