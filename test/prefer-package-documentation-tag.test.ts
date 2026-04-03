import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "prefer-package-documentation-tag",
    getPluginRule("prefer-package-documentation-tag"),
    {
        invalid: [
            {
                name: "reports preferPackageDocumentationTag and auto-fixes @module to @packageDocumentation",
                code: [
                    "/**",
                    " * @module",
                    " */",
                    "export function parseValue(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "preferPackageDocumentationTag" }],
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
                name: "is valid when @packageDocumentation tag is used",
                code: [
                    "/**",
                    " * @packageDocumentation",
                    " */",
                    "export function parseValue(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
