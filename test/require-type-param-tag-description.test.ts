import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-type-param-tag-description",
    getPluginRule("require-type-param-tag-description"),
    {
        invalid: [
            {
                name: "reports missingTypeParamTagDescription when @typeParam tag has no description",
                code: [
                    "/**",
                    " * Identity helper.",
                    " * @typeParam TValue",
                    " * @param value Input value.",
                    " * @returns Same value.",
                    " */",
                    "export function identity<TValue>(value: TValue): TValue {",
                    "    return value;",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingTypeParamTagDescription" }],
            },
        ],
        valid: [
            {
                name: "is valid when @typeParam tag includes a description",
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
            {
                name: "is valid when @template description continues on the next indented line (multiline)",
                code: [
                    "/**",
                    " * Identity helper.",
                    " * @template TValue",
                    " *   Value type.",
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
