import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-values.test` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-values";
const docsDescription =
    "require ts-extras objectValues over Object.values for stronger value inference.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-values";
const preferTsExtrasObjectValuesMessage =
    "Prefer `objectValues` from `ts-extras` over `Object.values(...)` for stronger value inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-values.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-values.invalid.ts";
const inlineInvalidCode = "const values = Object.values({ alpha: 1 });";
const inlineInvalidOutput = [
    'import { objectValues } from "ts-extras";',
    "const values = objectValues({ alpha: 1 });",
].join("\n");
const computedAccessValidCode =
    "const values = Object['values']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    values(value: { alpha: number }): readonly number[] {",
    "        return [value.alpha];",
    "    },",
    "};",
    "const values = helper.values({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    values(value: { alpha: number }): readonly number[] {",
    "        return [value.alpha];",
    "    },",
    "};",
    "const values = Object.values({ alpha: 1 });",
].join("\n");
const inlineFixableCode = [
    'import { objectValues } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const values = Object.values(sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectValues } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const values = objectValues(sample);",
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
            `Expected prefer-ts-extras-object-values text to contain replaceable segment: ${target}`
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
const objectValuesArgumentKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
>("callExpression", "identifier", "memberExpression", "objectLiteral");

const buildObjectValuesArgumentTemplate = (
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

const parseObjectValuesCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an objectValues call"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectValues: preferTsExtrasObjectValuesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-values metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-values internal listener guards", () => {
    it("ignores non-Identifier Object property access", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                isGlobalIdentifierNamed: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type?: string }>,
                    identifierName: string
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === identifierName,
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueReferenceReplacementFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-object-values")) as {
                    default: {
                        create: (context: unknown) => {
                            CallExpression?: (node: unknown) => void;
                        };
                    };
                };

            const listeners = authoredRuleModule.default.create({
                filename: "src/example.ts",
                report(descriptor: Readonly<{ messageId?: string }>) {
                    reportCalls.push(descriptor);
                },
                sourceCode: {
                    ast: {
                        body: [],
                    },
                },
            });

            const callExpressionListener = listeners.CallExpression;

            expect(callExpressionListener).toBeTypeOf("function");

            const privatePropertyValuesCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "values",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyValuesCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-object-values parse-safety guards", () => {
    it("fast-check: objectValues replacement remains parseable across argument expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                objectValuesArgumentKindArbitrary,
                includeUnicodeBannerArbitrary,
                (argumentKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const argumentTemplate =
                        buildObjectValuesArgumentTemplate(argumentKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectValues } from "ts-extras";',
                        ...argumentTemplate.declarations,
                        `const values = Object.values(${argumentTemplate.argumentExpression});`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectValues",
                        sourceText: generatedCode,
                        target: "Object.values",
                    });

                    const { callExpression } =
                        parseObjectValuesCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe("objectValues");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                {
                    messageId: "preferTsExtrasObjectValues",
                },
                {
                    messageId: "preferTsExtrasObjectValues",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.values usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectValues" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.values call",
            output: inlineInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectValues" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.values when objectValues import is in scope",
            output: inlineFixableOutput,
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: computedAccessValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores computed Object.values member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object values method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.keys usage",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.values call when Object binding is shadowed",
        },
    ],
});
