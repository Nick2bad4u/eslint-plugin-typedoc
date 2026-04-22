import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-extra-type-param-tags",
    getPluginRule("no-extra-type-param-tags"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Build a pair.",
                    " * @typeParam TLeft Left value type.",
                    " * @typeParam TRight Right value type.",
                    " * @typeParam TExtra Stale generic.",
                    " * @param left Left value.",
                    " * @param right Right value.",
                    " * @returns Pair tuple.",
                    " */",
                    "export function pair<TLeft, TRight>(left: TLeft, right: TRight): [TLeft, TRight] {",
                    "    return [left, right];",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "extraTypeParamTags" }],
                name: "reports extraTypeParamTags when @typeParam names a non-existent generic on a multi-generic function",
            },
            {
                code: [
                    "/**",
                    " * Parse numeric input.",
                    " * @typeParam TValue Stale generic.",
                    " * @param value Input value.",
                    " * @returns Parsed number.",
                    " */",
                    "export function parseNumber(value: string): number {",
                    "    return Number.parseInt(value, 10);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "extraTypeParamTags" }],
                name: "reports extraTypeParamTags when @typeParam names a non-existent generic on a non-generic function",
            },
        ],
        valid: [
            {
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
                name: "is valid when all @typeParam tags correspond to actual generic type parameters",
            },
            {
                code: [
                    "/**",
                    " * Identity.",
                    " * @template TValue Value type.",
                    " * @param value Input value.",
                    " * @returns The same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
                name: "is valid when @template tag documents a valid generic type parameter",
            },
        ],
    }
);
