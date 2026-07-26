import { build } from "esbuild";
import { join } from "node:path";

// Regolith executes filters from `.regolith/tmp`, where BP and RP are copies.
// Keeping this script outside those packs prevents the release cleanup step
// from shipping build tooling to Minecraft.
const workingRoot = process.cwd();
const minify = process.argv.includes("--minify");

await build({
  absWorkingDir: workingRoot,
  entryPoints: [join(workingRoot, "BP/scripts/main.js")],
  outfile: join(workingRoot, "BP/scripts/__bundle.js"),
  bundle: true,
  format: "esm",
  target: "es2020",
  minify,
  legalComments: minify ? "none" : "inline",
  logLevel: "warning",
  preserveSymlinks: true,
  alias: {
    DoriosCore: join(workingRoot, "BP/scripts/DoriosCore"),
    DoriosLib: join(workingRoot, "BP/scripts/DoriosLib"),
    ExampleCore: join(workingRoot, "BP/scripts/ExampleCore"),
  },
  external: [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-*",
    "@minecraft/common",
    "@minecraft/debug-utilities",
  ],
});

