import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-type-param-tag-description",
    getPluginRule("require-type-param-tag-description"),
    {
        invalid: [
            {
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
                name: "reports missingTypeParamTagDescription when @typeParam tag has no description",
            },
            {
                code: [
                    "/** @template {object} TValue */",
                    "export const identity = <TValue extends object>(value: TValue): TValue => value;",
                    "interface Factory {",
                    "    /** @typeParam {object} TValue */",
                    "    create<TValue extends object>(value: TValue): TValue;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingTypeParamTagDescription" },
                    { messageId: "missingTypeParamTagDescription" },
                ],
                name: "reports constrained type-parameter tags on arrows and method signatures exactly once",
            },
            {
                code: [
                    "/** @template TValue */",
                    "const first = <TValue>(value: TValue): TValue => value,",
                    "    second = <TValue>(value: TValue): TValue => value;",
                ].join("\n"),
                errors: [{ messageId: "missingTypeParamTagDescription" }],
                name: "reports a shared generic multi-declarator comment exactly once",
            },
            {
                code: [
                    "/** @template TValue */",
                    "declare function identity<TValue>(value: TValue): TValue;",
                    "abstract class AbstractFactory {",
                    "    /** @template TValue */",
                    "    abstract create<TValue>(value: TValue): TValue;",
                    "}",
                    "declare class AmbientFactory {",
                    "    /** @template TValue */",
                    "    create<TValue>(value: TValue): TValue;",
                    "}",
                    "interface Factory {",
                    "    /** @template TValue */",
                    "    <TValue>(value: TValue): TValue;",
                    "    /** @template TValue */",
                    "    new <TValue>(value: TValue): Factory;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingTypeParamTagDescription" },
                    { messageId: "missingTypeParamTagDescription" },
                    { messageId: "missingTypeParamTagDescription" },
                    { messageId: "missingTypeParamTagDescription" },
                    { messageId: "missingTypeParamTagDescription" },
                ],
                name: "supports declare functions, abstract and ambient methods, call signatures, and construct signatures",
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
                name: "is valid when @typeParam tag includes a description",
            },
            {
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
                name: "is valid when @template description continues on the next indented line (multiline)",
            },
            {
                code: [
                    "/** @template {object} TValue Value type. */",
                    "const identity = function <TValue extends object>(value: TValue): TValue { return value; };",
                ].join("\n"),
                name: "is valid when prose follows an optional JSDoc type-parameter constraint",
            },
        ],
    }
);
