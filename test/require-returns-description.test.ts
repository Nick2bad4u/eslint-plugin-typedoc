import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-returns-description",
    getPluginRule("require-returns-description"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Add values.",
                    " * @param left Left value.",
                    " * @param right Right value.",
                    " * @returns {number}",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Add values.",
                    " * @param left Left value.",
                    " * @param right Right value.",
                    " * @returns {number} Sum result.",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
