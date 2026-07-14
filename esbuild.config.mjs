import esbuild from "esbuild";
import os from "os";
import path from "path";
import fs from "fs";
const VAULT_PLUGIN_DIR = path.join(os.homedir(), "Library/Mobile Documents/iCloud~md~obsidian/Documents/MyObsidian/.obsidian/plugins/my-table-sticky-header");
import process from "process";

const prod = process.argv[2] === "production";

esbuild.build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    outfile: "main.js",
    minify: prod,
}).then(() => {
    // Also copy build artifacts into the local vault plugin dir for testing.
    try {
        fs.mkdirSync(VAULT_PLUGIN_DIR, { recursive: true });
        for (const f of ["main.js", "manifest.json", "styles.css"]) {
            if (fs.existsSync(f)) fs.copyFileSync(f, path.join(VAULT_PLUGIN_DIR, f));
        }
    } catch (e) {
        console.error("vault sync failed:", e);
    }
}).catch(() => process.exit(1));
