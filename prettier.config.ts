import type { Config } from "prettier";

const config: Config = {
    arrowParens: "always",
    bracketSameLine: false,
    bracketSpacing: true,
    checkIgnorePragma: false,
    cursorOffset: -1,
    embeddedLanguageFormatting: "auto",
    endOfLine: "auto",
    experimentalOperatorPosition: "end",
    experimentalTernaries: false,
    htmlWhitespaceSensitivity: "css",
    insertPragma: false,
    multilineArraysWrapThreshold: 2,
    objectWrap: "preserve",
    overrides: [
        {
            files: [
                "*.js",
                "*.jsx",
                "*.ts",
                "*.tsx",
                "*.mjs",
                "*.cjs",
            ],
            options: {
                jsdocBracketSpacing: false,
                jsdocCapitalizeDescription: true,
                jsdocCommentLineStrategy: "keep",
                jsdocDescriptionTag: false,
                jsdocDescriptionWithDot: false,
                jsdocEmptyCommentStrategy: "keep",
                jsdocKeepUnParseAbleExampleIndent: false,
                jsdocLineWrappingStyle: "greedy",
                jsdocPreferCodeFences: true,
                jsdocPrintWidth: 80,
                jsdocSeparateReturnsFromParam: true,
                jsdocSeparateTagGroups: true,
                jsdocSpaces: 1,
                jsdocVerticalAlignment: false,
                plugins: [
                    "prettier-plugin-jsdoc",
                    "prettier-plugin-interpolated-html-tags",
                    "@softonus/prettier-plugin-duplicate-remover",
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-merge",
                ],
                tsdoc: true,
                useTabs: false,
            } as Config,
        },
        {
            files: "tsconfig.*",
            options: {
                jsonRecursiveSort: false,
                jsonSortOrder: '{"*": "numeric"}',
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-sort-json",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "*.html",
            options: {
                htmlWhitespaceSensitivity: "strict",
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "@softonus/prettier-plugin-duplicate-remover",
                ],
                printWidth: 80,
                singleAttributePerLine: true,
                useTabs: false,
            } as Config,
        },
        {
            files: "*.user.js",
            options: {
                printWidth: 80,
                useTabs: false,
            },
        },
        {
            files: "*.md",
            options: {
                jsdocBracketSpacing: false,
                jsdocCapitalizeDescription: true,
                jsdocCommentLineStrategy: "keep",
                jsdocDescriptionTag: false,
                jsdocDescriptionWithDot: false,
                jsdocEmptyCommentStrategy: "keep",
                jsdocKeepUnParseAbleExampleIndent: false,
                jsdocLineWrappingStyle: "greedy",
                jsdocPreferCodeFences: true,
                jsdocPrintWidth: 80,
                jsdocSeparateReturnsFromParam: true,
                jsdocSeparateTagGroups: true,
                jsdocSpaces: 1,
                jsdocVerticalAlignment: false,
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-jsdoc",
                ],
                tabWidth: 1,
                useTabs: false,
            } as Config,
        },
        {
            files: "*.mdx",
            options: {
                jsdocBracketSpacing: false,
                jsdocCapitalizeDescription: true,
                jsdocCommentLineStrategy: "keep",
                jsdocDescriptionTag: false,
                jsdocDescriptionWithDot: false,
                jsdocEmptyCommentStrategy: "keep",
                jsdocKeepUnParseAbleExampleIndent: false,
                jsdocLineWrappingStyle: "greedy",
                jsdocPreferCodeFences: true,
                jsdocPrintWidth: 80,
                jsdocSeparateReturnsFromParam: true,
                jsdocSeparateTagGroups: true,
                jsdocSpaces: 1,
                jsdocVerticalAlignment: false,
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-jsdoc",
                ],
                printWidth: 100,
                tabWidth: 2,
                useTabs: false,
            } as Config,
        },
        {
            files: "*.toml",
            options: {
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-toml",
                ],
                printWidth: 120,
                tabWidth: 4,
                useTabs: false,
            } as Config,
        },
        {
            files: [
                "*.json",
                "**/.prettierrc",
                "**/.htmlhintrc",
            ],
            options: {
                jsonRecursiveSort: false,
                jsonSortOrder: '{"*": "numeric"}',
                plugins: [
                    "prettier-plugin-sort-json",
                    "prettier-plugin-multiline-arrays",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "*.sql",
            options: {
                language: "sqlite",
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-sql",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "*.sh",
            options: {
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-sh",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "*.properties",
            options: {
                escapeNonLatin1: false,
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-properties",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "*.ini",
            options: {
                iniSpaceAroundEquals: true,
                keySeparator: " = ",
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-ini",
                ],
                useTabs: false,
            } as Config,
        },
        {
            files: "**/package.json, **/package-lock.json",
            options: {
                plugins: [
                    "prettier-plugin-multiline-arrays",
                    "prettier-plugin-packagejson",
                ],
                tabWidth: 2,
                useTabs: false,
            } as Config,
        },
    ],
    plugins: ["prettier-plugin-multiline-arrays"],
    printWidth: 80,
    proseWrap: "preserve",
    quoteProps: "as-needed",
    requirePragma: false,
    semi: true,
    singleAttributePerLine: false,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "es5",
    useTabs: false,
    vueIndentScriptAndStyle: false,
};

export default config;
