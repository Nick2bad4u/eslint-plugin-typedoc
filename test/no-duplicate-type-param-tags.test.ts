import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-duplicate-type-param-tags",
    getPluginRule("no-duplicate-type-param-tags"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * Identity helper.",
                    " * @typeParam TValue Value type.",
                    " * @template TValue Duplicate value type.",
                    " * @param value Input value.",
                    " * @returns Same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "duplicateTypeParamTags" }],
                name: "reports duplicateTypeParamTags when @typeParam and @template declare the same type parameter",
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
                name: "is valid when each type parameter has exactly one @typeParam tag",
            },
        ],
    }
);
