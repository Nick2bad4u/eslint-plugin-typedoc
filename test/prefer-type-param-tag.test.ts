import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "prefer-type-param-tag",
    getPluginRule("prefer-type-param-tag"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Identity helper.",
                    " * @template TValue Value type.",
                    " * @param value Input value.",
                    " * @returns Same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "preferTypeParamTag" }],
                name: "reports preferTypeParamTag and auto-fixes @template to @typeParam",
                output: [
                    "/**",
                    " * Identity helper.",
                    " * @typeParam TValue Value type.",
                    " * @param value Input value.",
                    " * @returns Same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Identity helper.",
                    " * @typeParam TValue Value type.",
                    " * @param value Input value.",
                    " * @returns Same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
                name: "is valid when @typeParam is used instead of @template",
            },
        ],
    }
);
