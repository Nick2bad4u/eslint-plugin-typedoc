import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-from-entries.test` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-from-entries";
const docsDescription =
    "require ts-extras objectFromEntries over Object.fromEntries for stronger key/value inference.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-from-entries";
const preferTsExtrasObjectFromEntriesMessage =
    "Prefer `objectFromEntries` from `ts-extras` over `Object.fromEntries(...)` for stronger key and value inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-from-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-from-entries.invalid.ts";
const inlineInvalidCode =
    "const value = Object.fromEntries([['alpha', 1]] as const);";
const inlineFixableCode = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = Object.fromEntries(entries);",
].join("\n");
const inlineFixableOutput = [
    'import { objectFromEntries } from "ts-extras";',
    "",
    "const entries = [['alpha', 1]] as const;",
    "const value = objectFromEntries(entries);",
].join("\n");
const inlineInvalidOutputCode = [
    'import { objectFromEntries } from "ts-extras";',
    "const value = objectFromEntries([['alpha', 1]] as const);",
].join("\n");
const computedAccessValidCode =
    "const value = Object['fromEntries']([['alpha', 1]] as const);";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    fromEntries(entries: ReadonlyArray<readonly [string, number]>): { alpha: number } {",
    "        return { alpha: entries[0][1] };",
    "    },",
    "};",
    "const value = helper.fromEntries([['alpha', 1]] as const);",
].join("\n");
const wrongPropertyValidCode =
    "const value = Object.entries({ alpha: 1 } as const);";
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    fromEntries(entries: ReadonlyArray<readonly [string, number]>): { alpha: number } {",
    "        return { alpha: entries[0][1] };",
    "    },",
    "};",
    "const value = Object.fromEntries([['alpha', 1]] as const);",
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
            `Expected prefer-ts-extras-object-from-entries text to contain replaceable segment: ${target}`
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
const fromEntriesArgumentKindArbitrary = fc.constantFrom<
    "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
>("callExpression", "identifier", "memberExpression", "arrayLiteral");

const buildFromEntriesArgumentTemplate = (
    kind: "arrayLiteral" | "callExpression" | "identifier" | "memberExpression"
): Readonly<{
    argumentExpression: string;
    declarations: readonly string[];
}> => {
    if (kind === "identifier") {
        return {
            argumentExpression: "entries",
            declarations: ['const entries = [["alpha", 1]] as const;'],
        };
    }

    if (kind === "memberExpression") {
        return {
            argumentExpression: "holder.entries",
            declarations: [
                'const holder = { entries: [["alpha", 1]] as const } as const;',
            ],
        };
    }

    if (kind === "callExpression") {
        return {
            argumentExpression: "buildEntries()",
            declarations: [
                'const buildEntries = (): ReadonlyArray<readonly [string, number]> => [["alpha", 1] as const];',
            ],
        };
    }

    return {
        argumentExpression: '[["alpha", 1]] as const',
        declarations: [],
    };
};

const parseObjectFromEntriesCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an objectFromEntries call"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectFromEntries: preferTsExtrasObjectFromEntriesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-from-entries metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-from-entries internal listener guards", () => {
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
                (await import("../src/rules/prefer-ts-extras-object-from-entries")) as {
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

            const privatePropertyFromEntriesCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "fromEntries",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyFromEntriesCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-object-from-entries parse-safety guards", () => {
    it("fast-check: objectFromEntries replacement remains parseable across argument expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fromEntriesArgumentKindArbitrary,
                includeUnicodeBannerArbitrary,
                (argumentKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const argumentTemplate =
                        buildFromEntriesArgumentTemplate(argumentKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectFromEntries } from "ts-extras";',
                        ...argumentTemplate.declarations,
                        `const value = Object.fromEntries(${argumentTemplate.argumentExpression});`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectFromEntries",
                        sourceText: generatedCode,
                        target: "Object.fromEntries",
                    });

                    const { callExpression } =
                        parseObjectFromEntriesCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe(
                            "objectFromEntries"
                        );
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
                    messageId: "preferTsExtrasObjectFromEntries",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.fromEntries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.fromEntries call",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectFromEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.fromEntries when objectFromEntries import is in scope",
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
            name: "ignores computed Object.fromEntries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object fromEntries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.entries usage",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.fromEntries call when Object binding is shadowed",
        },
    ],
});
