import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-param-tag-description",
    getPluginRule("require-param-tag-description"),
    {
        invalid: [
            {
                name: "reports missingParamTagDescription when @param tag has a name but no description",
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
                name: "is valid when @param tag uses dash separator before description",
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
                name: "is valid when @param description continues on the next indented line (multiline)",
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
