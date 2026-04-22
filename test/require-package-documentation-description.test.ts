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
                name: "reports missingPackageDocumentationDescription when @packageDocumentation has no description",
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
                name: "is valid when @packageDocumentation is followed by a description",
            },
            {
                code: "export const value = 1;",
                filename: "test/package-doc-description.ts",
                name: "is valid by default in test/ paths",
            },
            {
                code: "export declare const value: number;",
                filename: "types/public-api.d.ts",
                name: "is valid when declaration files are ignored via option",
                options: [{ ignoreDeclarationFiles: true }],
            },
        ],
    }
);
