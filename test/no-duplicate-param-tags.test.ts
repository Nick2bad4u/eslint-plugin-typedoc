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
            // ArrowFunctionExpression without JSDoc: exercises ArrowFunctionExpression handler
            {
                code: "export const add = (left: number, right: number) => left + right;",
            },
            // FunctionExpression without JSDoc: exercises FunctionExpression handler
            {
                code: "export const fn = function(x: number) { return x; };",
            },
            // MethodDefinition with valid unique @param tags: exercises MethodDefinition handler
            {
                code: [
                    "export class Calculator {",
                    "    /**",
                    "     * Multiply two numbers.",
                    "     * @param left Left value.",
                    "     * @param right Right value.",
                    "     * @returns Product.",
                    "     */",
                    "    multiply(left: number, right: number): number {",
                    "        return left * right;",
                    "    }",
                    "}",
                ].join("\n"),
            },
            // TSDeclareFunction with valid unique @param tags: exercises TSDeclareFunction handler
            {
                code: [
                    "/**",
                    " * Merge two records.",
                    " * @param a First record.",
                    " * @param b Second record.",
                    " */",
                    "declare function merge(a: Record<string, unknown>, b: Record<string, unknown>): void;",
                ].join("\n"),
            },
        ],
    }
);
