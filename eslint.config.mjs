import js from "@eslint/js";
import markdown from "@eslint/markdown";
import tsParser from "@typescript-eslint/parser";
import * as jsoncParser from "jsonc-eslint-parser";

import typedoc from "./plugin.mjs";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
    {
        ignores: [
            "**/.cache/**",
            "**/.docusaurus/**",
            "**/.turbo/**",
            "**/.vite/**",
            "**/coverage/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/temp/**",
            "docs/docusaurus/build/**",
            "docs/docusaurus/.docusaurus/**",
        ],
    },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                projectService: true,
                sourceType: "module",
            },
        },
        plugins: {
            typedoc,
        },
        rules: {
            "typedoc/enforce-typedoc-tags": "error",
            "typedoc/no-typedoc-tag-alias": "error",
            "typedoc/no-unresolved-typedoc-link": "error",
            "typedoc/require-export-docs": "error",
        },
    },
    {
        files: ["**/*.md"],
        plugins: {
            markdown,
        },
        processor: "markdown/markdown",
    },
    {
        files: ["**/*.{json,jsonc}"],
        languageOptions: {
            parser: jsoncParser,
        },
        plugins: {
            typedoc,
        },
        rules: {
            "typedoc/require-typedoc-config-options": "error",
        },
    },
];

export default eslintConfig;
