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
    $schema: "https://unpkg.com/knip@6/schema.json",
    ignoreBinaries: [
        "grype",
        "lychee",
        // False-positve Knip thinks knip.config.ts is a binary entry point, but it's actually just a config file.
        "knip.config.ts",
    ],
    ignoreDependencies: [
        ".*prettier.*",
        "@easyops-cn/docusaurus-search-local",
        "@easyops-cn/docusaurus-theme-docusaurus-search-local",
        "@eslint.*",
        "@microsoft/tsdoc-config",
        "@stryker-ignorer/*",
        "@stryker-mutator/*",
        "@types.*",
        "eslint.*",
        "postcss.*",
        "remark.*",
        "stylelint.*",
        "ts.*",
        "type.*",

        // Items flagged by knip report (ignored to suppress false-positives / repo-local tools)
        "clsx",
        "react-github-btn",
        "git-cliff",
        "gitcliff-config-nick2bad4u",
        "gitleaks-config-nick2bad4u",
        "htmlhint",
        "jscpd-config-nick2bad4u",
        "leasot",
        "lychee-config-nick2bad4u",
        "markdown-link-check",
        "mermaid",
        "mermaid-config-nick2bad4u",
        "ncu-config-nick2bad4u",
        "secretlint-config-nick2bad4u",
        "sloc",
        "storybook",
        "yamllint-config-nick2bad4u",
        "react",
    ],
    ignoreExportsUsedInFile: {
        interface: true,
        type: true,
    },
    includeEntryExports: false,
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
            entry: ["scripts/**/*.{js,mjs}", "src/plugin.ts"],
            project: [
                "!src/**/*.spec.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "!src/**/*.test.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
                "src/**/*.{js,ts,tsx,jsx,mts,cjs,cts,mjs}",
            ],
        },
    },
};

export default knipConfig;
