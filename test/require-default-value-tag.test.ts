import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-default-value-tag",
    getPluginRule("require-default-value-tag"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Default theme color used by the docs site.",
                    " */",
                    'export const themeColor = "#2B134E";',
                ].join("\n"),
                errors: [{ messageId: "missingDefaultValueTag" }],
                name: "reports missingDefaultValueTag and auto-adds @defaultValue for an exported const without one",
                output: [
                    "/**",
                    " * Default theme color used by the docs site.",
                    ' * @defaultValue `"#2B134E"`',
                    " */",
                    'export const themeColor = "#2B134E";',
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Default theme color used by the docs site.",
                    ' * @defaultValue `"#2B134E"`',
                    " */",
                    'export const themeColor = "#2B134E";',
                ].join("\n"),
                name: "is valid when exported const already has @defaultValue tag",
            },
            {
                code: [
                    "/**",
                    " * Runtime parser helper.",
                    " */",
                    "export const createParser = (): void => {};",
                ].join("\n"),
                name: "is valid for exported arrow function (no @defaultValue required)",
            },
        ],
    }
);
