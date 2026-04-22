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
            name: "reports extraParamTags when a @param tag names a non-existent parameter",
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
            name: "is valid when all @param tags correspond to actual parameters",
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
            name: "is valid when parameter uses destructuring pattern",
        },
        // ArrowFunctionExpression without JSDoc: exercises ArrowFunctionExpression handler
        {
            code: "export const add = (left: number, right: number) => left + right;",
            name: "is valid for arrow function without JSDoc (exercises ArrowFunctionExpression handler)",
        },
        // FunctionExpression without JSDoc: exercises FunctionExpression handler
        {
            code: "export const fn = function(x: number) { return x; };",
            name: "is valid for function expression without JSDoc (exercises FunctionExpression handler)",
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
            name: "is valid for class method with matching @param tags (exercises MethodDefinition handler)",
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
            name: "is valid for declare function with matching @param tags (exercises TSDeclareFunction handler)",
        },
    ],
});
