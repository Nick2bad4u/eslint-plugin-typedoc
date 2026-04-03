import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-package-documentation",
    getPluginRule("require-package-documentation"),
    {
        invalid: [
            {
                name: "reports missingPackageDocumentation and auto-adds @packageDocumentation for file without one",
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
                name: "is valid when file already has a @packageDocumentation tag",
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
                name: "is valid for file with no exports (no package doc required)",
                code: [
                    "function internalOnly(value: string): string {",
                    "    return value.trim();",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
