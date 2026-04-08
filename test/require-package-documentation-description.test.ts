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
            {
                name: "is valid by default in test/ paths",
                filename: "test/package-doc-description.ts",
                code: "export const value = 1;",
            },
            {
                name: "is valid when declaration files are ignored via option",
                filename: "types/public-api.d.ts",
                options: [{ ignoreDeclarationFiles: true }],
                code: "export declare const value: number;",
            },
        ],
    }
);
