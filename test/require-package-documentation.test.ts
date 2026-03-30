import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-package-documentation",
    getPluginRule("require-package-documentation"),
    {
        invalid: [
            {
                code: [
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingPackageDocumentation" }],
                output: [
                    "/**",
                    " * @packageDocumentation",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
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
                    "",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "function internalOnly(value: string): string {",
                    "    return value.trim();",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
