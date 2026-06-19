import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const typedocAllConfig = /** @type {unknown} */ (plugin.configs?.["all"]);
const typedocAllRules =
    typeof typedocAllConfig === "object" &&
    typedocAllConfig !== null &&
    "rules" in typedocAllConfig &&
    typeof typedocAllConfig.rules === "object" &&
    typedocAllConfig.rules !== null
        ? typedocAllConfig.rules
        : {};

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.withoutTypedoc,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        name: "Local TypeDoc",
        plugins: {
            typedoc: plugin,
        },
        rules: {
            ...typedocAllRules,

            "typedoc/no-empty-private-remarks-tag": "off",
            "typedoc/no-extra-type-param-tags": "off",
            "typedoc/no-unknown-tags": "warn",
            "typedoc/require-code-fence-language": "off",
            "typedoc/require-default-value-tag": "off",
            "typedoc/require-example-tag": "off",
            "typedoc/require-package-documentation": "off",
            "typedoc/require-package-documentation-description": "off",
            "typedoc/require-param-tag-description": "off",
            "typedoc/require-param-tags": "off",
            "typedoc/require-returns-description": "off",
            "typedoc/require-returns-tag": "off",
            "typedoc/require-see-tag-link": "off",
            "typedoc/require-since-tag-description": "off",
            "typedoc/require-throws-description": "off",
            "typedoc/require-throws-tag": "off",
            "typedoc/require-type-param-tag-description": "off",
            "typedoc/require-type-param-tags": "off",
        },
    },
    {
        files: [
            "benchmarks/eslint-benchmark-config.mjs",
            "commitlint.config.mjs",
        ],
        name: "MJS Boundary Types",
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
        },
    },
    {
        ignores: [
            ".remarkrc.mjs",
            "benchmark/**",
            "benchmarks/**",
            "docs/docusaurus/typedoc-plugins/*.{mjs,mts}",
            "knip.config.ts",
            "plugin.d.mts",
            "remark-plugin-shims.d.ts",
            "stryker.config.mjs",
            "vitest.stryker.config.ts",
        ],
        name: "Generated and external tooling shims",
    },
    {
        files: [".ncurc.json", "docs/docusaurus/static/manifest.json"],
        name: "Non-default JSON schemas",
        rules: {
            "json-schema-validator-2/no-invalid": "off",
        },
    },
    {
        files: ["docs/docusaurus/docusaurus.config.ts"],
        name: "Docusaurus runtime config",
        rules: {
            "n/no-process-env": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-short-arrow-method": "off",
            "unicorn/prefer-temporal": "off",
        },
    },
    {
        files: ["docs/docusaurus/sidebars.rules.ts"],
        name: "Docusaurus sidebar generation",
        rules: {
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "n/no-sync": "off",
            "unicorn/no-array-sort": "off",
            "unicorn/prefer-import-meta-properties": "off",
        },
    },
    {
        files: ["docs/docusaurus/src/**/*.css"],
        name: "Docusaurus CSS uses direct Stylelint gate",
        rules: {
            "stylelint-2/stylelint": "off",
        },
    },
    {
        files: [
            "docs/docusaurus/src/components/GitHubStats.tsx",
            "docs/docusaurus/src/js/modernEnhancements.ts",
            "docs/docusaurus/src/pages/index.tsx",
        ],
        name: "Docusaurus client surface conventions",
        rules: {
            "canonical/filename-no-index": "off",
            "runtime-cleanup/no-unmanaged-event-listeners": "off",
            "unicorn/filename-case": "off",
        },
    },
    {
        files: [
            "src/_internal/create-prefer-tag-rule.ts",
            "src/_internal/create-require-comment-tag-description-rule.ts",
            "src/_internal/doc-tag-blocks.ts",
            "src/_internal/sorted-copy.ts",
            "src/rules/no-empty-example-tag.ts",
            "src/rules/no-empty-private-remarks-tag.ts",
            "src/rules/no-empty-remarks-tag.ts",
            "src/rules/no-empty-see-tag.ts",
            "src/rules/no-malformed-inline-links.ts",
            "src/rules/no-unknown-tags.ts",
            "src/rules/require-see-tag-link.ts",
        ],
        name: "AST traversal loop control",
        rules: {
            "unicorn/no-break-in-nested-loop": "off",
        },
    },
    {
        files: [
            "src/_internal/exported-declarations.ts",
            "src/rules/require-default-value-tag.ts",
            "src/rules/require-package-documentation-description.ts",
            "src/rules/require-package-documentation.ts",
            "src/rules/require-throws-tag.ts",
        ],
        name: "TypeDoc syntax pair checks",
        rules: {
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
        },
    },
    {
        files: [
            "src/_internal/require-comment-file-options.ts",
            "src/_internal/rule-docs-metadata.ts",
            "src/rules/require-throws-tag.ts",
        ],
        name: "Predicate naming compatibility",
        rules: {
            "unicorn/consistent-boolean-name": "off",
        },
    },
    {
        files: [
            "src/rules/require-param-tag-description.ts",
            "src/rules/require-type-param-tag-description.ts",
        ],
        name: "Rule context report helpers",
        rules: {
            "unicorn/max-nested-calls": "off",
        },
    },
    {
        files: ["src/_internal/rules-registry.ts"],
        name: "Generated rule registry",
        rules: {
            "import-x/max-dependencies": "off",
        },
    },
    {
        files: ["src/rules/require-throws-tag.ts"],
        name: "Throw statement traversal",
        rules: {
            complexity: "off",
        },
    },
    {
        files: ["src/rules/no-unknown-tags.ts"],
        name: "Unknown tag allowlist composition",
        rules: {
            "unicorn/prefer-iterator-concat": "off",
        },
    },
    {
        files: [
            "test/has-meaningful-tag-description.property.test.ts",
            "test/plugin-entry.test.ts",
        ],
        name: "Plugin smoke tests",
        rules: {
            "test-signal/require-negative-path": "off",
        },
    },
];

export default config;
