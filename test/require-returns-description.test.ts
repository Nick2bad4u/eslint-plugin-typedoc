import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-returns-description",
    getPluginRule("require-returns-description"),
    {
        invalid: [
            // FunctionDeclaration with empty @returns (baseline)
            {
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a FunctionDeclaration (baseline)",
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
            // MethodDefinition with empty @returns: exercises MethodDefinition handler
            {
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a MethodDefinition",
                code: [
                    "export class Calculator {",
                    "    /**",
                    "     * Multiply two numbers.",
                    "     * @returns {number}",
                    "     */",
                    "    multiply(left: number, right: number): number {",
                    "        return left * right;",
                    "    }",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
            },
            // TSDeclareFunction with empty @returns: exercises TSDeclareFunction handler
            {
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a TSDeclareFunction",
                code: [
                    "/**",
                    " * Load resource from API.",
                    " * @returns {Promise<void>}",
                    " */",
                    "declare function load(): Promise<void>;",
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
            },
        ],
        valid: [
            // FunctionDeclaration with description (baseline)
            {
                name: "is valid when FunctionDeclaration @returns tag includes a description (baseline)",
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
            // FunctionDeclaration without any JSDoc comment: no error; covers line 96
            // (getLeadingDocComment returns null → early return)
            {
                name: "is valid for FunctionDeclaration without JSDoc (covers early return when no doc comment)",
                code: "export function add(left: number, right: number): number { return left + right; }",
            },
            // FunctionExpression without JSDoc: exercises FunctionExpression handler + line 96
            {
                name: "is valid for FunctionExpression without JSDoc (exercises FunctionExpression handler)",
                code: "export const fn = function() {};",
            },
            // ArrowFunctionExpression without JSDoc: exercises ArrowFunctionExpression handler + line 96
            {
                name: "is valid for ArrowFunctionExpression without JSDoc (exercises ArrowFunctionExpression handler)",
                code: "export const arrow = (x: number) => x * 2;",
            },
            // MethodDefinition with @returns description: exercises MethodDefinition handler (no error)
            {
                name: "is valid when MethodDefinition @returns tag includes a description",
                code: [
                    "export class Calculator {",
                    "    /**",
                    "     * Multiply two numbers.",
                    "     * @returns {number} The product of left and right.",
                    "     */",
                    "    multiply(left: number, right: number): number {",
                    "        return left * right;",
                    "    }",
                    "}",
                ].join("\n"),
            },
            // MethodDefinition without any @returns tag: no error (hasTag stays false)
            {
                name: "is valid for MethodDefinition without @returns tag (hasTag stays false)",
                code: [
                    "export class Logger {",
                    "    /**",
                    "     * Write a message to the log.",
                    "     * @param message Message text.",
                    "     */",
                    "    log(message: string): void {",
                    "        console.log(message);",
                    "    }",
                    "}",
                ].join("\n"),
            },
            // TSDeclareFunction with @returns description
            {
                name: "is valid when TSDeclareFunction @returns tag includes a description",
                code: [
                    "/**",
                    " * Load resource from API.",
                    " * @returns {Promise<void>} Resolves when load completes.",
                    " */",
                    "declare function load(): Promise<void>;",
                ].join("\n"),
            },
        ],
    }
);
