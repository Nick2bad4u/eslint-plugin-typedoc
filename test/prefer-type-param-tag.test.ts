import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "prefer-type-param-tag",
    getPluginRule("prefer-type-param-tag"),
    {
        invalid: [
            {
                name: "reports preferTypeParamTag and auto-fixes @template to @typeParam",
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
                name: "is valid when @typeParam is used instead of @template",
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
            },
        ],
    }
);
