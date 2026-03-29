import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-entries` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-entries";
const docsDescription =
    "require ts-extras objectEntries over Object.entries for stronger key/value inference.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-entries";
const preferTsExtrasObjectEntriesMessage =
    "Prefer `objectEntries` from `ts-extras` over `Object.entries(...)` for stronger key and value inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-entries.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-entries.invalid.ts";
const inlineInvalidCode = "const pairs = Object.entries({ alpha: 1 });";
const inlineInvalidOutput = [
    'import { objectEntries } from "ts-extras";',
    "const pairs = objectEntries({ alpha: 1 });",
].join("\n");
const inlineFixableCode = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = Object.entries(sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectEntries } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const entries = objectEntries(sample);",
].join("\n");
const computedAccessValidCode =
    "const pairs = Object['entries']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    entries(value: { alpha: number }): readonly [string, number][] {",
    "        return [['alpha', value.alpha]];",
    "    },",
    "};",
    "const pairs = helper.entries({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const keys = Object.keys({ alpha: 1 });";
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    entries(value: { alpha: number }): readonly [string, number][] {",
    "        return [['alpha', value.alpha]];",
    "    },",
    "};",
    "const pairs = Object.entries({ alpha: 1 });",
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
            `Expected prefer-ts-extras-object-entries text to contain replaceable segment: ${target}`
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
const objectEntriesArgumentKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
>("callExpression", "identifier", "memberExpression", "objectLiteral");

const buildObjectEntriesArgumentTemplate = (
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

const parseObjectEntriesCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an objectEntries call"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectEntries: preferTsExtrasObjectEntriesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-entries metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-entries internal listener guards", () => {
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
                (await import("../src/rules/prefer-ts-extras-object-entries")) as {
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

            const privatePropertyEntriesCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "entries",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyEntriesCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-object-entries parse-safety guards", () => {
    it("fast-check: objectEntries replacement remains parseable across argument expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                objectEntriesArgumentKindArbitrary,
                includeUnicodeBannerArbitrary,
                (argumentKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const argumentTemplate =
                        buildObjectEntriesArgumentTemplate(argumentKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectEntries } from "ts-extras";',
                        ...argumentTemplate.declarations,
                        `const pairs = Object.entries(${argumentTemplate.argumentExpression});`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectEntries",
                        sourceText: generatedCode,
                        target: "Object.entries",
                    });

                    const { callExpression } =
                        parseObjectEntriesCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe(
                            "objectEntries"
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
                { messageId: "preferTsExtrasObjectEntries" },
                { messageId: "preferTsExtrasObjectEntries" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.entries usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.entries call",
            output: inlineInvalidOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectEntries" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.entries when objectEntries import is in scope",
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
            name: "ignores computed Object.entries member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object entries method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.keys usage",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.entries call when Object binding is shadowed",
        },
    ],
});
