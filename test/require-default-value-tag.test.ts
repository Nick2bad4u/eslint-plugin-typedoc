import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-default-value-tag",
    getPluginRule("require-default-value-tag"),
    {
        invalid: [
            {
                name: "reports missingDefaultValueTag and auto-adds @defaultValue for an exported const without one",
                code: [
                    "/**",
                    " * Default theme color used by the docs site.",
                    " */",
                    'export const themeColor = "#2B134E";',
                ].join("\n"),
                errors: [{ messageId: "missingDefaultValueTag" }],
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
                name: "is valid when exported const already has @defaultValue tag",
                code: [
                    "/**",
                    " * Default theme color used by the docs site.",
                    ' * @defaultValue `"#2B134E"`',
                    " */",
                    'export const themeColor = "#2B134E";',
                ].join("\n"),
            },
            {
                name: "is valid for exported arrow function (no @defaultValue required)",
                code: [
                    "/**",
                    " * Runtime parser helper.",
                    " */",
                    "export const createParser = (): void => {};",
                ].join("\n"),
            },
        ],
    }
);
