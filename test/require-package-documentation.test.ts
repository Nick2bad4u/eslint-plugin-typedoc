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
                errors: [
                    {
                        messageId: "missingPackageDocumentation",
                        suggestions: [
                            {
                                messageId: "addPackageDocumentationSuggestion",
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
                    },
                ],
                name: "reports missingPackageDocumentation and suggests @packageDocumentation for file without one",
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
                name: "is valid when file already has a @packageDocumentation tag",
            },
            {
                code: [
                    "function internalOnly(value: string): string {",
                    "    return value.trim();",
                    "}",
                ].join("\n"),
                name: "is valid for file with no exports (no package doc required)",
            },
            {
                code: "export const exposed = 1;",
                filename: "test/module-without-package-doc.ts",
                name: "is valid by default in test/ paths",
            },
            {
                code: "export declare const exposed: number;",
                filename: "types/public-api.d.ts",
                name: "is valid when declaration files are ignored via option",
                options: [{ ignoreDeclarationFiles: true }],
            },
        ],
    }
);
