import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import ts from "../../frontend/node_modules/typescript/lib/typescript.js";

const frontendRoot = resolve(import.meta.dirname, "../../frontend");
const requireFromFrontend = createRequire(pathToFileURL(join(frontendRoot, "package.json")).href);
const cache = new Map<string, Record<string, unknown>>();

function withExtension(target: string): string {
  if (existsSync(target) && !target.endsWith(".css")) {
    return target;
  }
  for (const ext of [".tsx", ".ts", ".js"]) {
    if (existsSync(target + ext)) {
      return target + ext;
    }
  }
  return target;
}

function resolveSpec(fromFile: string, spec: string): string {
  if (spec.startsWith("@/")) {
    return withExtension(join(frontendRoot, spec.slice(2)));
  }
  return withExtension(resolve(dirname(fromFile), spec));
}

export function loadTsx(file: string): Record<string, unknown> {
  const abs = withExtension(resolve(file));
  const cached = cache.get(abs);
  if (cached) {
    return cached;
  }
  const source = readFileSync(abs, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      verbatimModuleSyntax: false,
    },
    fileName: abs,
  }).outputText;
  const module = { exports: {} as Record<string, unknown> };
  cache.set(abs, module.exports);
  const localRequire = (spec: string) => {
    if (spec.endsWith(".css")) {
      return {};
    }
    if (spec.startsWith(".") || spec.startsWith("@/")) {
      return loadTsx(resolveSpec(abs, spec));
    }
    return requireFromFrontend(spec);
  };
  const run = new Function("exports", "require", "module", js) as (
    exports: Record<string, unknown>,
    require: (spec: string) => unknown,
    module: { exports: Record<string, unknown> },
  ) => void;
  run(module.exports, localRequire, module);
  return module.exports;
}
