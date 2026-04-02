import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-exported-doc-comment",
    getPluginRule("require-exported-doc-comment"),
    {
        invalid: [
            // FunctionDeclaration (named): baseline case
            {
                code: "export function buildClient(): void {}",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document buildClient.",
                    " */",
                    "export function buildClient(): void {}",
                ].join("\n"),
            },
            // VariableDeclaration: covers getDeclarationName VariableDeclaration branch
            {
                code: "export const version = '1.0.0';",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document version.",
                    " */",
                    "export const version = '1.0.0';",
                ].join("\n"),
            },
            // ClassDeclaration: covers getDeclarationName with class name
            {
                code: "export class MyService {}",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document MyService.",
                    " */",
                    "export class MyService {}",
                ].join("\n"),
            },
            // TSEnumDeclaration: covers getDeclarationName with enum name
            {
                code: "export enum Status { Active, Inactive }",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document Status.",
                    " */",
                    "export enum Status { Active, Inactive }",
                ].join("\n"),
            },
            // TSTypeAliasDeclaration: covers getDeclarationName with type alias name
            {
                code: "export type MyAlias = string;",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document MyAlias.",
                    " */",
                    "export type MyAlias = string;",
                ].join("\n"),
            },
            // TSModuleDeclaration (namespace): covers getDeclarationName with namespace name
            {
                code: "export namespace Utils {}",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document Utils.",
                    " */",
                    "export namespace Utils {}",
                ].join("\n"),
            },
            // ExportDefaultDeclaration with anonymous FunctionDeclaration (id === null):
            // covers getDeclarationName null-id fallback (line 50 in exported-declarations.ts)
            {
                code: "export default function() {}",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document exported declaration.",
                    " */",
                    "export default function() {}",
                ].join("\n"),
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
            },
            // ExportNamedDeclaration with null declaration (re-export specifier):
            // covers isDocumentableExportDeclaration(null) → returns false (line 22)
            {
                code: ["const foo = 1;", "export { foo };"].join("\n"),
            },
            // Documented variable export
            {
                code: [
                    "/**",
                    " * Current package version.",
                    " */",
                    "export const version = '1.0.0';",
                ].join("\n"),
            },
        ],
    }
);
