import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-package-documentation-description",
    getPluginRule("require-package-documentation-description"),
    {
        invalid: [
            {
                name: "reports missingPackageDocumentationDescription when @packageDocumentation has no description",
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
                name: "is valid when @packageDocumentation is followed by a description",
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
