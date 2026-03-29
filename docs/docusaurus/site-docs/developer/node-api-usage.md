---
title: Node.js ESLint API Usage
description: Programmatic ESLint examples using lintFiles, lintText, outputFixes, and formatters.
sidebar_position: 23
---

# Node.js ESLint API Usage

Use this pattern when embedding linting in scripts, custom tooling, or release checks.

## Minimal API flow

```js
import { ESLint } from "eslint";
import typefest from "eslint-plugin-typefest";

const eslint = new ESLint({
  overrideConfig: {
    files: ["**/*.ts"],
    plugins: {
      typefest,
    },
    rules: {
      "typefest/prefer-type-fest-primitive": "error",
    },
  },
});

const fileResults = await eslint.lintFiles(["src/**/*.ts"]);

const textResults = await eslint.lintText(
  "type PrimitiveAlias = string | number | bigint | boolean | symbol | null | undefined;",
  { filePath: "virtual.ts" }
);

const allResults = [...fileResults, ...textResults];

await ESLint.outputFixes(allResults);

const formatter = await eslint.loadFormatter("stylish");
console.log(formatter.format(allResults));
```

## API usage notes

- `lintFiles(...)` is best for repository scans.
- `lintText(...)` is useful for generated/virtual content.
- `ESLint.outputFixes(...)` writes autofix changes to disk for file-based results.
- `loadFormatter(...)` lets you switch output style per integration context.

## Debugging API integrations

- Compare API output with CLI output for the same target files.
- Use `--print-config` with matching file paths to validate effective settings.
- Ensure API runtime uses the same Node version and dependency graph as CI.
