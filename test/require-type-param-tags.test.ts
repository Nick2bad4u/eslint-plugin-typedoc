import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-type-param-tags",
    getPluginRule("require-type-param-tags"),
    {
        invalid: [
            {
                name: "reports missingTypeParamTags and auto-adds TODO stub for undocumented generic type parameter",
                code: [
                    "/**",
                    " * Map one value into another type.",
                    " * @typeParam TInput Input value type.",
                    " * @param input Input value.",
                    " * @param mapper Mapping function.",
                    " * @returns Mapped value.",
                    " */",
                    "export function mapValue<TInput, TOutput>(",
                    "    input: TInput,",
                    "    mapper: (value: TInput) => TOutput",
                    "): TOutput {",
                    "    return mapper(input);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingTypeParamTags" }],
                output: [
                    "/**",
                    " * Map one value into another type.",
                    " * @typeParam TInput Input value type.",
                    " * @param input Input value.",
                    " * @param mapper Mapping function.",
                    " * @returns Mapped value.",
                    " * @typeParam TOutput TODO describe TOutput.",
                    " */",
                    "export function mapValue<TInput, TOutput>(",
                    "    input: TInput,",
                    "    mapper: (value: TInput) => TOutput",
                    "): TOutput {",
                    "    return mapper(input);",
                    "}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                name: "is valid when all generic type parameters have @typeParam tags",
                code: [
                    "/**",
                    " * Build a pair.",
                    " * @typeParam TLeft Left value type.",
                    " * @typeParam TRight Right value type.",
                    " * @param left Left value.",
                    " * @param right Right value.",
                    " * @returns Pair tuple.",
                    " */",
                    "export function pair<TLeft, TRight>(left: TLeft, right: TRight): [TLeft, TRight] {",
                    "    return [left, right];",
                    "}",
                ].join("\n"),
            },
            {
                name: "is valid when @template tag documents a generic type parameter",
                code: [
                    "/**",
                    " * Format a value.",
                    " * @template TValue Value type.",
                    " * @param value Input value.",
                    " * @returns Formatted value.",
                    " */",
                    "export function formatValue<TValue>(value: TValue): string {",
                    "    return String(value);",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
