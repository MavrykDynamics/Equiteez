import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const replacements = {
  "@mavrykdynamics/taquito": "@mavrykdynamics/webmavryk",
  "@mavrykdynamics/taquito-ledger-signer":
    "@mavrykdynamics/webmavryk-ledger-signer",
  "@mavrykdynamics/taquito-local-forging":
    "@mavrykdynamics/webmavryk-local-forging",
  "@mavrykdynamics/taquito-michel-codec":
    "@mavrykdynamics/webmavryk-michel-codec",
  "@mavrykdynamics/taquito-michelson-encoder":
    "@mavrykdynamics/webmavryk-michelson-encoder",
  "@mavrykdynamics/taquito-rpc": "@mavrykdynamics/webmavryk-rpc",
  "@mavrykdynamics/taquito-signer": "@mavrykdynamics/webmavryk-signer",
  "@mavrykdynamics/taquito-tzip12": "@mavrykdynamics/webmavryk-tzip12",
  "@mavrykdynamics/taquito-tzip16": "@mavrykdynamics/webmavryk-tzip16",
  "@mavrykdynamics/taquito-utils": "@mavrykdynamics/webmavryk-utils",
  "@mavrykdynamics/beacon-dapp": "@mavrykdynamics/mavlet-dapp",
  "@mavrykdynamics/taquito-beacon-wallet":
    "@mavrykdynamics/webmavryk-mavlet-wallet",
};

const exts = [".ts", ".tsx", ".js", ".jsx"];

// Sort longest keys first (to avoid partial matches)
const ordered = Object.entries(replacements).sort(
  ([a], [b]) => b.length - a.length
);

function safeReplace(content) {
  for (const [oldPkg, newPkg] of ordered) {
    const regex = new RegExp(`(['"])${oldPkg}\\1`, "g");
    content = content.replace(regex, `$1${newPkg}$1`);
  }
  return content;
}

function walk(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);

    if (stat.isDirectory()) {
      walk(fp);
    } else if (exts.some((ext) => fp.endsWith(ext))) {
      const original = fs.readFileSync(fp, "utf8");
      const updated = safeReplace(original);

      if (updated !== original) {
        fs.writeFileSync(fp, updated, "utf8");
        console.log("Updated:", fp);
      }
    }
  }
}

// ----------------------
// UPDATE package.json
// ----------------------
function updatePackageJson() {
  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  let uninstall = [];
  let install = [];

  const sections = ["dependencies", "devDependencies"];

  for (const section of sections) {
    if (!pkg[section]) continue;

    for (const [oldPkg, newPkg] of Object.entries(replacements)) {
      if (pkg[section][oldPkg]) {
        const oldVersion = pkg[section][oldPkg];

        // remove old
        delete pkg[section][oldPkg];
        uninstall.push(oldPkg);

        // add new with same version (or "*" if you prefer)
        pkg[section][newPkg] = oldVersion;
        install.push(`${newPkg}@${oldVersion}`);
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("Updated package.json");

  return { uninstall, install };
}

// ----------------------
// RUN NPM COMMANDS
// ----------------------
function runCommands(uninstall, install) {
  if (uninstall.length > 0) {
    console.log("Uninstalling:", uninstall.join(" "));
    execSync(`npm uninstall ${uninstall.join(" ")}`, { stdio: "inherit" });
  }

  if (install.length > 0) {
    console.log("Installing:", install.join(" "));
    execSync(`npm install ${install.join(" ")}`, { stdio: "inherit" });
  }
}

// ----------------------
// MAIN EXECUTION
// ----------------------
walk("./app");

const { uninstall, install } = updatePackageJson();
runCommands(uninstall, install);

console.log("All done!");
