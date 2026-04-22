import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "prefer-package-documentation-tag",
    getPluginRule("prefer-package-documentation-tag"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * @module",
                    " */",
                    "export function parseValue(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "preferPackageDocumentationTag" }],
                name: "reports preferPackageDocumentationTag and auto-fixes @module to @packageDocumentation",
                output: [
                    "/**",
                    " * @packageDocumentation",
                    " */",
                    "export function parseValue(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * @packageDocumentation",
                    " */",
                    "export function parseValue(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
                name: "is valid when @packageDocumentation tag is used",
            },
        ],
    }
);
