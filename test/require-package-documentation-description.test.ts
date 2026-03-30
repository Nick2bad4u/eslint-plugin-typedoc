import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-package-documentation-description",
    getPluginRule("require-package-documentation-description"),
    {
        invalid: [
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
                errors: [
                    { messageId: "missingPackageDocumentationDescription" },
                ],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * @packageDocumentation",
                    " * Public API helpers for parsing values.",
                    " */",
                    "",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
