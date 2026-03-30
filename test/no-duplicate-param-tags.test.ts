import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-duplicate-param-tags",
    getPluginRule("no-duplicate-param-tags"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Add two numbers.",
                    " * @param left Left value.",
                    " * @param left Duplicate doc.",
                    " * @param right Right value.",
                    " * @returns Sum.",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "duplicateParamTags" }],
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
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
