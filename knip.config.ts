/**
 * Repository-specific configuration for Knip dependency analysis.
 *
 * @packageDocumentation
 */
import type { KnipConfig } from "knip";

/**
 * Knip configuration that scopes entry points and dependency heuristics to the
 * repository layout.
 */
const knipConfig: KnipConfig = {
    $schema: "https://unpkg.com/knip@5/schema.json",
    entry: [],
    ignore: [
        "docs/docusaurus/src/css/custom.css.d.ts",
        "docs/docusaurus/typedoc-plugins/hashToBangLinks.mjs",
        "docs/docusaurus/typedoc-plugins/hashToBangLinksCore.d.mts",
        "docs/docusaurus/typedoc-plugins/hashToBangLinksCore.mjs",
        "docs/docusaurus/typedoc-plugins/prefixDocLinks.mjs",
        "docs/docusaurus/typedoc-plugins/prefixDocLinksCore.d.mts",
        "docs/docusaurus/typedoc-plugins/prefixDocLinksCore.mjs",
    ],
    ignoreBinaries: [
        "git-cz",
        "grype",
        "open-cli",
        // False-positve Knip thinks knip.config.ts is a binary entry point, but it's actually just a config file.
        "knip.config.ts",
    ],
    ignoreDependencies: [
        ".*prettier.*",
        "@docusaurus/faster",
        "@easyops-cn/docusaurus-search-local",
        "@easyops-cn/docusaurus-theme-docusaurus-search-local",
        "@eslint.*",
        "@microsoft/tsdoc-config",
        "@secretlint/secretlint-rule-anthropic",
        "@secretlint/secretlint-rule-aws",
        "@secretlint/secretlint-rule-database-connection-string",
        "@secretlint/secretlint-rule-gcp",
        "@secretlint/secretlint-rule-github",
        "@secretlint/secretlint-rule-no-dotenv",
        "@secretlint/secretlint-rule-no-homedir",
        "@secretlint/secretlint-rule-npm",
        "@secretlint/secretlint-rule-openai",
        "@secretlint/secretlint-rule-pattern",
        "@secretlint/secretlint-rule-preset-recommend",
        "@secretlint/secretlint-rule-privatekey",
        "@secretlint/secretlint-rule-secp256k1-privatekey",
        "@stylelint.*",
        "@types.*",
        "eslint.*",
        "madge",
        "postcss.*",
        "remark.*",
        "stylelint.*",
        "ts.*",
        "type.*",
        "unified",

        // Items flagged by knip report (ignored to suppress false-positives / repo-local tools)
        "clsx",
        "react-github-btn",
        "actionlint",
        "commitlint",
        "gitleaks-secret-scanner",
        "htmlhint",
        "leasot",
        "markdown-link-check",
        "sloc",
        "storybook",
        "yamllint-js",
        "react",
    ],
    ignoreExportsUsedInFile: {
        interface: true,
        type: true,
    },
    includeEntryExports: true,
    project: [],
    rules: {
        binaries: "error",
        catalog: "error",
        dependencies: "error",
        devDependencies: "error",
        duplicates: "error",
        enumMembers: "warn",
        exports: "warn",
        files: "error",
        namespaceMembers: "warn",
        nsExports: "warn",
        nsTypes: "warn",
        optionalPeerDependencies: "error",
        types: "warn",
        unlisted: "error",
        unresolved: "error",
    },
    workspaces: {
        ".": {
            entry: [],
            project: [],
        },
        src: {
            entry: ["src/plugin.ts"],
            project: [
                "!src/**/*.spec.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "!src/**/*.test.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "src/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
    },
};

export default knipConfig;
