import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-returns-description",
    getPluginRule("require-returns-description"),
    {
        invalid: [
            // FunctionDeclaration with empty @returns (baseline)
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
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a FunctionDeclaration (baseline)",
            },
            // MethodDefinition with empty @returns: exercises MethodDefinition handler
            {
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
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a MethodDefinition",
            },
            // TSDeclareFunction with empty @returns: exercises TSDeclareFunction handler
            {
                code: [
                    "/**",
                    " * Load resource from API.",
                    " * @returns {Promise<void>}",
                    " */",
                    "declare function load(): Promise<void>;",
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
                name: "reports missingReturnsDescription when @returns tag has only a type annotation on a TSDeclareFunction",
            },
            {
                code: [
                    "/** @returns {Promise<{ id: string }>} */",
                    'export const load = async (): Promise<{ id: string }> => ({ id: "value" });',
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
                name: "reports a nested JSDoc return type without prose on an exported arrow exactly once",
            },
            {
                code: [
                    "class Loader {",
                    "    /** @returns {Promise<{ id: string }>} */",
                    '    load = async (): Promise<{ id: string }> => ({ id: "value" });',
                    "    /** @returns {string} */",
                    '    format = function (): string { return "value"; };',
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingReturnsDescription" },
                    { messageId: "missingReturnsDescription" },
                ],
                name: "reports function-valued class property comments exactly once",
            },
            {
                code: [
                    "interface Loader {",
                    "    /** @returns {string} */",
                    "    load(): string;",
                    "    /** @returns {Promise<{ id: string }>} */",
                    "    (): Promise<{ id: string }>;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingReturnsDescription" },
                    { messageId: "missingReturnsDescription" },
                ],
                name: "reports TypeScript method and call signature comments exactly once",
            },
            {
                code: [
                    "abstract class AbstractLoader {",
                    "    /** @returns {string} */",
                    "    abstract load(): string;",
                    "}",
                    "declare class AmbientLoader {",
                    "    /** @returns {string} */",
                    "    load(): string;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingReturnsDescription" },
                    { messageId: "missingReturnsDescription" },
                ],
                name: "reports abstract and ambient class method comments exactly once",
            },
            {
                code: [
                    "/** @returns {number} */",
                    "export const first = (): number => 1,",
                    "    second = (): number => 2;",
                ].join("\n"),
                errors: [{ messageId: "missingReturnsDescription" }],
                name: "reports an exported shared multi-declarator comment exactly once",
            },
        ],
        valid: [
            // FunctionDeclaration with description (baseline)
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
                name: "is valid when FunctionDeclaration @returns tag includes a description (baseline)",
            },
            // FunctionDeclaration without any JSDoc comment: no error; covers line 96
            // (getLeadingDocComment returns null → early return)
            {
                code: "export function add(left: number, right: number): number { return left + right; }",
                name: "is valid for FunctionDeclaration without JSDoc (covers early return when no doc comment)",
            },
            // FunctionExpression without JSDoc: exercises FunctionExpression handler + line 96
            {
                code: "export const fn = function() {};",
                name: "is valid for FunctionExpression without JSDoc (exercises FunctionExpression handler)",
            },
            // ArrowFunctionExpression without JSDoc: exercises ArrowFunctionExpression handler + line 96
            {
                code: "export const arrow = (x: number) => x * 2;",
                name: "is valid for ArrowFunctionExpression without JSDoc (exercises ArrowFunctionExpression handler)",
            },
            // MethodDefinition with @returns description: exercises MethodDefinition handler (no error)
            {
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
                name: "is valid when MethodDefinition @returns tag includes a description",
            },
            // MethodDefinition without any @returns tag: no error (hasTag stays false)
            {
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
                name: "is valid for MethodDefinition without @returns tag (hasTag stays false)",
            },
            // TSDeclareFunction with @returns description
            {
                code: [
                    "/**",
                    " * Load resource from API.",
                    " * @returns {Promise<void>} Resolves when load completes.",
                    " */",
                    "declare function load(): Promise<void>;",
                ].join("\n"),
                name: "is valid when TSDeclareFunction @returns tag includes a description",
            },
            {
                code: [
                    "/** @returns {Promise<{ id: string }>} Loaded record. */",
                    'const load = async (): Promise<{ id: string }> => ({ id: "value" });',
                ].join("\n"),
                name: "is valid when prose follows a nested JSDoc return type",
            },
            {
                code: [
                    "/** @returns {() => number} Creates a number reader. */",
                    "const createReader = (): (() => number) => (): number => 1;",
                ].join("\n"),
                name: "does not attach an outer function comment to a nested returned arrow",
            },
        ],
    }
);
