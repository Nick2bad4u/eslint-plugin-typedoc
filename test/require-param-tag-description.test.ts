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
                name: "reports missingParamTagDescription when @param tag has a name but no description",
            },
            {
                code: [
                    "/** @param {string} value */",
                    "export const exportedArrow = (value: string): string => value;",
                    "/** @param {string} value */",
                    "const localArrow = (value: string): string => value;",
                    "/** @param {string} value */",
                    "export const exportedExpression = function (value: string): string { return value; };",
                    "/** @param {string} value */",
                    "const localExpression = function (value: string): string { return value; };",
                ].join("\n"),
                errors: [
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                ],
                name: "reports typed name-only tags once on exported and local arrow functions and function expressions",
            },
            {
                code: [
                    "class Parser {",
                    "    /** @param {string} value */",
                    "    parse(value: string): string { return value; }",
                    "    /** @param {string} value */",
                    "    parseArrow = (value: string): string => value;",
                    "    /** @param {string} value */",
                    "    parseExpression = function (value: string): string { return value; };",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                ],
                name: "reports each class method and function-valued property comment exactly once",
            },
            {
                code: [
                    "/** @param {string} value */",
                    "declare function parse(value: string): string;",
                    "interface Parser {",
                    "    /** @param {string} value */",
                    "    parse(value: string): string;",
                    "    /** @param {string} value */",
                    "    (value: string): string;",
                    "    /** @param {string} value */",
                    "    new (value: string): Parser;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                ],
                name: "supports declare functions and TypeScript method, call, and construct signatures",
            },
            {
                code: [
                    "/** @param value */",
                    "const first = (value: string): string => value,",
                    "    second = (value: string): string => value;",
                ].join("\n"),
                errors: [{ messageId: "missingParamTagDescription" }],
                name: "reports a shared multi-declarator comment exactly once",
            },
            {
                code: [
                    "abstract class AbstractParser {",
                    "    /** @param {string} value */",
                    "    abstract parse(value: string): string;",
                    "}",
                    "declare class AmbientParser {",
                    "    /** @param {string} value */",
                    "    parse(value: string): string;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingParamTagDescription" },
                    { messageId: "missingParamTagDescription" },
                ],
                name: "reports abstract and ambient class method comments exactly once",
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
                name: "is valid when @param tag uses dash separator before description",
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
                name: "is valid when @param description continues on the next indented line (multiline)",
            },
            {
                code: [
                    "/**",
                    " * Normalize values.",
                    " * @param {Array<{ id: string }>} values Values to normalize.",
                    " */",
                    "const normalize = (values: Array<{ id: string }>): Array<{ id: string }> => values;",
                ].join("\n"),
                name: "is valid when a nested JSDoc type precedes the parameter name and prose",
            },
            {
                code: [
                    "/** @param value {@link String} input */",
                    "const parse = (value: string): string => value;",
                ].join("\n"),
                name: "does not confuse an inline JSDoc tag in prose with a type annotation",
            },
        ],
    }
);
