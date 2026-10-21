import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { syncStaticData } from "./sync-static-data.mjs";
import { writeHtaccess } from "./write-htaccess.mjs";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basePath = process.env.BASE_PATH ?? "/aprendizaje-continuo";

if (!basePath.startsWith("/")) {
  console.error("BASE_PATH debe empezar por /.");
  process.exit(1);
}

syncStaticData();

const dynamicPages = [
  "app/concepts/[slug]/page.tsx",
  "app/explorer/[slug]/page.tsx",
  "app/snippets/[slug]/page.tsx",
  "app/technologies/[slug]/page.tsx",
];
const personalActions = path.join(frontendRoot, "lib/personalActions.ts");
const personalStub = path.join(frontendRoot, "lib/personalActions.static.ts");
const dynamicMarker = "export const dynamicParams = true;";
const staticMarker = "export const dynamicParams = false;";
const dynamicForce = 'export const dynamic = "force-dynamic";';
const originals = new Map();

for (const relative of dynamicPages) {
  const file = path.join(frontendRoot, relative);
  const text = readFileSync(file, "utf8");
  if (!text.includes(dynamicMarker)) {
    console.error(`${relative} debe exportar dynamicParams como literal true.`);
    process.exit(1);
  }
  if (!text.includes(dynamicForce)) {
    console.error(`${relative} debe exportar dynamic = "force-dynamic".`);
    process.exit(1);
  }
  originals.set(file, text);
  writeFileSync(
    file,
    text.replace(dynamicMarker, staticMarker).replace(`${dynamicForce}\r\n`, "").replace(`${dynamicForce}\n`, ""),
  );
}
originals.set(personalActions, readFileSync(personalActions, "utf8"));
writeFileSync(personalActions, readFileSync(personalStub, "utf8"));

let result;
try {
  result = spawnSync("npx", ["next", "build"], {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, API_MODE: "static", BASE_PATH: basePath },
  });
} finally {
  for (const [file, text] of originals) {
    writeFileSync(file, text);
  }
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

writeHtaccess(path.join(frontendRoot, "out"), basePath);
console.log(`Demo estática en out/ con BASE_PATH=${basePath}`);
