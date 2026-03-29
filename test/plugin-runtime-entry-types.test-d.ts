/**
 * @packageDocumentation
 * Type-level contract tests for runtime entrypoint declarations.
 */
import type { ESLint } from "eslint";

import typefestPlugin from "eslint-plugin-typefest";
import { assertType } from "vitest";

assertType<ESLint.Plugin>(typefestPlugin);

assertType<ESLint.Plugin["configs"] | undefined>(typefestPlugin.configs);
assertType<string | undefined>(typefestPlugin.meta?.name);
assertType<string | undefined>(typefestPlugin.meta?.version);
assertType<ESLint.Plugin["rules"] | undefined>(typefestPlugin.rules);
