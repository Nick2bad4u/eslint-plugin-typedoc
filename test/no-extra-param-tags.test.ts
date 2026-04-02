import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-extra-param-tags", getPluginRule("no-extra-param-tags"), {
    invalid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @param extra No longer exists.",
                " * @returns Sum.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "extraParamTags" }],
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
        {
            code: [
                "/**",
                " * Normalize options.",
                " * @param options Input options object.",
                " */",
                "export function normalizeOptions({ enabled }: { enabled: boolean }): boolean {",
                "    return enabled;",
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
        // MethodDefinition: exercises MethodDefinition handler
        {
            code: [
                "export class Calculator {",
                "    /**",
                "     * Multiply two numbers.",
                "     * @param left Left value.",
                "     * @param right Right value.",
                "     */",
                "    multiply(left: number, right: number): number {",
                "        return left * right;",
                "    }",
                "}",
            ].join("\n"),
        },
        // TSDeclareFunction: exercises TSDeclareFunction handler
        {
            code: [
                "/**",
                " * Combine two strings.",
                " * @param a First string.",
                " * @param b Second string.",
                " */",
                "declare function combine(a: string, b: string): string;",
            ].join("\n"),
        },
    ],
});
