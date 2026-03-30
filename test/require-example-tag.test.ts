import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-example-tag", getPluginRule("require-example-tag"), {
    invalid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @returns Sum.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "missingExampleTag" }],
            output: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @returns Sum.",
                " * @example TODO add usage example for add.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @returns Sum.",
                " * @example",
                " * add(1, 2);",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
        {
            code: ["export function undocumented(): void {}"].join("\n"),
        },
    ],
});
