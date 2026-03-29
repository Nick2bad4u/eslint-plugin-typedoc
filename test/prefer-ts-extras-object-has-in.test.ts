/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-has-in.test` behavior.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const rule = getPluginRule("prefer-ts-extras-object-has-in");
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-has-in.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-has-in.invalid.ts";
const inlineInvalidThreeArgumentReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect.has(monitorRecord, "status", "extra");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineInvalidThreeArgumentReflectHasOutput = [
    'import { objectHasIn } from "ts-extras";',
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = objectHasIn(monitorRecord, "status", "extra");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineFixableReflectHasCode = [
    'import { objectHasIn } from "ts-extras";',
    "",
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect.has(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineFixableReflectHasOutput = [
    'import { objectHasIn } from "ts-extras";',
    "",
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = objectHasIn(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineInvalidLogicalGuardNoAutofixCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    "const shouldContinue =",
    "    Math.random() > 0.5 &&",
    '    Reflect.has(monitorRecord, "status");',
    "",
    "String(shouldContinue);",
].join("\n");
const inlineInvalidLogicalGuardSuggestionOutput = [
    'import { objectHasIn } from "ts-extras";',
    "declare const monitorRecord: { readonly status?: string };",
    "",
    "const shouldContinue =",
    "    Math.random() > 0.5 &&",
    '    objectHasIn(monitorRecord, "status");',
    "",
    "String(shouldContinue);",
].join("\n");
const inlineValidComputedReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Reflect["has"](monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidReflectHasOneArgumentCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    "const hasStatus = Reflect.has(monitorRecord);",
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidObjectHasOwnCode = [
    "declare const monitorRecord: { readonly status?: string };",
    "",
    'const hasStatus = Object.hasOwn(monitorRecord, "status");',
    "",
    "String(hasStatus);",
].join("\n");
const inlineValidCustomHasMethodCode = [
    "const helper = {",
    "    has(target: object, key: PropertyKey): boolean {",
    "        return key in target;",
    "    },",
    "};",
    'const hasStatus = helper.has({ status: "ok" }, "status");',
    "String(hasStatus);",
].join("\n");
const inlineValidReflectGetCode = [
    "declare const monitorRecord: { readonly status?: string };",
    'const value = Reflect.get(monitorRecord, "status");',
    "String(value);",
].join("\n");
const inlineValidGlobalReflectHasCode = [
    "declare const monitorRecord: { readonly status?: string };",
    'const hasStatus = globalThis.Reflect.has(monitorRecord, "status");',
    "String(hasStatus);",
].join("\n");
const shadowedReflectBindingValidCode = [
    "const Reflect = {",
    "    has(target: object, key: PropertyKey): boolean {",
    "        return Object.prototype.hasOwnProperty.call(target, key);",
    "    },",
    "};",
    'const hasStatus = Reflect.has({ status: "ok" }, "status");',
    "String(hasStatus);",
].join("\n");

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-ts-extras-object-has-in text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const reflectHasArgumentKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
>("callExpression", "identifier", "memberExpression", "objectLiteral");

const buildReflectHasArgumentTemplate = (
    kind: "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
): Readonly<{
    argumentExpression: string;
    declarations: readonly string[];
}> => {
    if (kind === "identifier") {
        return {
            argumentExpression: "record",
            declarations: ["const record = { alpha: 1 } as const;"],
        };
    }

    if (kind === "memberExpression") {
        return {
            argumentExpression: "holder.record",
            declarations: [
                "const holder = { record: { alpha: 1 } } as const satisfies Readonly<{ readonly record: { readonly alpha: number } }>;",
            ],
        };
    }

    if (kind === "callExpression") {
        return {
            argumentExpression: "buildRecord()",
            declarations: [
                "const buildRecord = (): Readonly<{ alpha: number }> => ({ alpha: 1 });",
            ],
        };
    }

    return {
        argumentExpression: "{ alpha: 1 }",
        declarations: [],
    };
};

const parseObjectHasInCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.VariableDeclaration &&
            statement.declarations.length === 1
        ) {
            const declaration = statement.declarations[0];
            if (
                declaration?.type === AST_NODE_TYPES.VariableDeclarator &&
                declaration.init !== null &&
                declaration.init.type === AST_NODE_TYPES.CallExpression
            ) {
                return {
                    ast: parsed.ast,
                    callExpression: declaration.init,
                };
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable initialized from an objectHasIn call"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-ts-extras-object-has-in", {
    defaultOptions: [],
    docsDescription:
        "require ts-extras objectHasIn over Reflect.has for stronger key-in-object narrowing.",
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectHasIn:
            "Prefer `objectHasIn` from `ts-extras` over `Reflect.has` for better type narrowing.",
        suggestTsExtrasObjectHasIn:
            "Replace this `Reflect.has(...)` call with `objectHasIn(...)` from `ts-extras`.",
    },
    name: "prefer-ts-extras-object-has-in",
});

describe("prefer-ts-extras-object-has-in parse-safety guards", () => {
    it("fast-check: objectHasIn replacement remains parseable across Reflect.has argument variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                reflectHasArgumentKindArbitrary,
                includeUnicodeBannerArbitrary,
                (argumentKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const argumentTemplate =
                        buildReflectHasArgumentTemplate(argumentKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectHasIn } from "ts-extras";',
                        ...argumentTemplate.declarations,
                        `const hasAlpha = Reflect.has(${argumentTemplate.argumentExpression}, "alpha");`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectHasIn",
                        sourceText: generatedCode,
                        target: "Reflect.has",
                    });

                    const { callExpression } =
                        parseObjectHasInCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe("objectHasIn");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run("prefer-ts-extras-object-has-in", rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectHasIn",
                },
                {
                    messageId: "preferTsExtrasObjectHasIn",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Reflect.has checks",
        },
        {
            code: inlineInvalidThreeArgumentReflectHasCode,
            errors: [{ messageId: "preferTsExtrasObjectHasIn" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Reflect.has call with extra argument",
            output: inlineInvalidThreeArgumentReflectHasOutput,
        },
        {
            code: inlineFixableReflectHasCode,
            errors: [{ messageId: "preferTsExtrasObjectHasIn" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Reflect.has when objectHasIn import is in scope",
            output: inlineFixableReflectHasOutput,
        },
        {
            code: inlineInvalidLogicalGuardNoAutofixCode,
            errors: [
                {
                    messageId: "preferTsExtrasObjectHasIn",
                    suggestions: [
                        {
                            messageId: "suggestTsExtrasObjectHasIn",
                            output: inlineInvalidLogicalGuardSuggestionOutput,
                        },
                    ],
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports logical-guard Reflect.has without autofix",
            output: null,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidComputedReflectHasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Reflect.has member access",
        },
        {
            code: inlineValidReflectHasOneArgumentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Reflect.has call with too few arguments",
        },
        {
            code: inlineValidObjectHasOwnCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.hasOwn usage",
        },
        {
            code: inlineValidCustomHasMethodCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Reflect has helper calls",
        },
        {
            code: inlineValidReflectGetCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Reflect member calls that are not has",
        },
        {
            code: inlineValidGlobalReflectHasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis-qualified Reflect.has calls",
        },
        {
            code: shadowedReflectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Reflect.has call when Reflect binding is shadowed",
        },
    ],
});
