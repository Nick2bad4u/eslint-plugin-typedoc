import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-param-tags", getPluginRule("require-param-tags"), {
    invalid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [
                {
                    messageId: "missingParamTags",
                    suggestions: [
                        {
                            messageId: "addParamTagsSuggestion",
                            output: [
                                "/**",
                                " * Add two numbers.",
                                " * @param left First value.",
                                " * @param right",
                                " */",
                                "export function add(left: number, right: number): number {",
                                "    return left + right;",
                                "}",
                            ].join("\n"),
                        },
                    ],
                },
            ],
            name: "reports missingParamTags and suggests adding bare @param tags",
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " * @param right Second value.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            name: "is valid when all function parameters have @param tags",
        },
        {
            code: [
                "/**",
                " * Add two numbers.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            filename: "test/require-param-tags.ts",
            name: "is valid by default in test/ paths",
        },
        {
            code: [
                "/**",
                " * Add two numbers.",
                " */",
                "export declare function add(left: number, right: number): number;",
            ].join("\n"),
            filename: "types/public-api.d.ts",
            name: "is valid when declaration files are ignored via option",
            options: [{ ignoreDeclarationFiles: true }],
        },
    ],
});
