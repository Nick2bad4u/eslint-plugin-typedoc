import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-param-tags", getPluginRule("require-param-tags"), {
    invalid: [
        {
            name: "reports missingParamTags and suggests adding bare @param tags",
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
        },
    ],
    valid: [
        {
            name: "is valid when all function parameters have @param tags",
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
        },
        {
            name: "is valid by default in test/ paths",
            filename: "test/require-param-tags.ts",
            code: [
                "/**",
                " * Add two numbers.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
        {
            name: "is valid when declaration files are ignored via option",
            filename: "types/public-api.d.ts",
            options: [{ ignoreDeclarationFiles: true }],
            code: [
                "/**",
                " * Add two numbers.",
                " */",
                "export declare function add(left: number, right: number): number;",
            ].join("\n"),
        },
    ],
});
