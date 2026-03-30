import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-param-tag-description",
    getPluginRule("require-param-tag-description"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Add two values.",
                    " * @param left",
                    " * @param right Right value.",
                    " * @returns Sum.",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingParamTagDescription" }],
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Add two values.",
                    " * @param left - Left value.",
                    " * @param right Right value.",
                    " * @returns Sum.",
                    " */",
                    "export function add(left: number, right: number): number {",
                    "    return left + right;",
                    "}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Normalize list.",
                    " * @param values",
                    " *   Items to normalize.",
                    " * @returns Normalized list.",
                    " */",
                    "export function normalize(values: readonly string[]): readonly string[] {",
                    "    return values;",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
