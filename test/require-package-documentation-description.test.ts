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
            {
                code: [
                    "/**",
                    " * @packageDocumentation",
                    " * @public",
                    " */",
                    "export const value = 1;",
                ].join("\n"),
                errors: [
                    { messageId: "missingPackageDocumentationDescription" },
                ],
                name: "does not treat an unrelated modifier tag as package summary prose",
            },
            {
                code: [
                    "/**",
                    " * @packageDocumentation",
                    " * @remarks Implementation details.",
                    " */",
                    "export const value = 1;",
                ].join("\n"),
                errors: [
                    { messageId: "missingPackageDocumentationDescription" },
                ],
                name: "does not treat an unrelated block tag payload as package summary prose",
            },
            {
                code: [
                    "/**",
                    " * @module public-api",
                    " */",
                    "export const value = 1;",
                ].join("\n"),
                errors: [
                    { messageId: "missingPackageDocumentationDescription" },
                ],
                name: "does not treat a legacy module rename as descriptive prose",
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
                code: [
                    "/**",
                    " * Public API helpers for parsing values.",
                    " * @packageDocumentation",
                    " * @public",
                    " */",
                    "export const value = 1;",
                ].join("\n"),
                name: "is valid when summary prose appears before @packageDocumentation",
            },
            {
                code: [
                    "/**",
                    " * @module public-api",
                    " * Public API helpers for parsing values.",
                    " */",
                    "export const value = 1;",
                ].join("\n"),
                name: "is valid when legacy @module has prose on a continuation line",
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
