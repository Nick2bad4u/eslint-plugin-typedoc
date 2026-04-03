import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-param-tags", getPluginRule("require-param-tags"), {
    invalid: [
        {
            name: "reports missingParamTags and auto-adds TODO stub for undocumented parameter",
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "missingParamTags" }],
            output: [
                "/**",
                " * Add two numbers.",
                " * @param left First value.",
                " * @param right TODO describe right.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
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
    ],
});
