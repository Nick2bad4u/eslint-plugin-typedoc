import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-exported-doc-comment",
    getPluginRule("require-exported-doc-comment"),
    {
        invalid: [
            {
                code: "export function buildClient(): void {}",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * buildClient API documentation.",
                                    " */",
                                    "export function buildClient(): void {}",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for FunctionDeclaration (baseline)",
            },
            {
                code: "export const version = '1.0.0';",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * version API documentation.",
                                    " */",
                                    "export const version = '1.0.0';",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for VariableDeclaration",
            },
            {
                code: "export class MyService {}",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * MyService API documentation.",
                                    " */",
                                    "export class MyService {}",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for ClassDeclaration",
            },
            {
                code: "export enum Status { Active, Inactive }",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * Status API documentation.",
                                    " */",
                                    "export enum Status { Active, Inactive }",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for TSEnumDeclaration",
            },
            {
                code: "export type MyAlias = string;",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * MyAlias API documentation.",
                                    " */",
                                    "export type MyAlias = string;",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for TSTypeAliasDeclaration",
            },
            {
                code: "export namespace Utils {}",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * Utils API documentation.",
                                    " */",
                                    "export namespace Utils {}",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment and suggests doc stub for TSModuleDeclaration (namespace)",
            },
            {
                code: "export default function() {}",
                errors: [
                    {
                        messageId: "missingDocComment",
                        suggestions: [
                            {
                                messageId: "addDocCommentSuggestion",
                                output: [
                                    "/**",
                                    " * exported declaration API documentation.",
                                    " */",
                                    "export default function() {}",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
                name: "reports missingDocComment for anonymous default export function (covers null-id fallback)",
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Build the API client.",
                    " */",
                    "export function buildClient(): void {}",
                ].join("\n"),
                name: "is valid when exported function has a JSDoc comment",
            },
            {
                code: [
                    "/**",
                    " * Public API shape.",
                    " */",
                    "export interface PublicApi {",
                    "    run(): void;",
                    "}",
                ].join("\n"),
                name: "is valid when exported interface has a JSDoc comment",
            },
            // ExportNamedDeclaration with null declaration (re-export specifier):
            // covers isDocumentableExportDeclaration(null) → returns false (line 22)
            {
                code: ["const foo = 1;", "export { foo };"].join("\n"),
                name: "is valid for re-export specifier without declaration (covers isDocumentableExportDeclaration null branch)",
            },
            // Documented variable export
            {
                code: [
                    "/**",
                    " * Current package version.",
                    " */",
                    "export const version = '1.0.0';",
                ].join("\n"),
                name: "is valid when exported const has a JSDoc comment",
            },
            {
                code: "export function undocumented(): void {}",
                filename: "test/exported-doc-comment.ts",
                name: "is valid by default in test/ paths",
            },
            {
                code: "export declare function undocumented(): void;",
                filename: "types/public-api.d.ts",
                name: "is valid when declaration files are ignored via option",
                options: [{ ignoreDeclarationFiles: true }],
            },
        ],
    }
);
