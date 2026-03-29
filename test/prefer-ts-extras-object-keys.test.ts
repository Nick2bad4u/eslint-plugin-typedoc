import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-keys.test` behavior.
 */
import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-object-keys";
const docsDescription =
    "require ts-extras objectKeys over Object.keys for stronger key inference.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-keys";
const preferTsExtrasObjectKeysMessage =
    "Prefer `objectKeys` from `ts-extras` over `Object.keys(...)` for stronger key inference.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-object-keys.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-keys.invalid.ts";
const inlineInvalidCode = "const keys = Object.keys({ alpha: 1 });";
const computedAccessValidCode = "const keys = Object['keys']({ alpha: 1 });";
const nonObjectReceiverValidCode = [
    "const helper = {",
    "    keys(value: { alpha: number }): readonly string[] {",
    "        return ['alpha'];",
    "    },",
    "};",
    "const keys = helper.keys({ alpha: 1 });",
].join("\n");
const wrongPropertyValidCode = "const values = Object.values({ alpha: 1 });";
const shadowedObjectBindingValidCode = [
    "const Object = {",
    "    keys(value: { alpha: number }): readonly string[] {",
    "        return ['alpha'];",
    "    },",
    "};",
    "const keys = Object.keys({ alpha: 1 });",
].join("\n");
const inlineFixableCode = [
    'import { objectKeys } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const keys = Object.keys(sample);",
].join("\n");
const inlineFixableOutput = [
    'import { objectKeys } from "ts-extras";',
    "",
    "const sample = { alpha: 1 } as const;",
    "const keys = objectKeys(sample);",
].join("\n");
const inlineInvalidOutputCode = [
    'import { objectKeys } from "ts-extras";',
    "const keys = objectKeys({ alpha: 1 });",
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
            `Expected prefer-ts-extras-object-keys text to contain replaceable segment: ${target}`
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
const objectKeysArgumentKindArbitrary = fc.constantFrom<
    "callExpression" | "identifier" | "memberExpression" | "objectLiteral"
>("callExpression", "identifier", "memberExpression", "objectLiteral");

const buildObjectKeysArgumentTemplate = (
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

const parseObjectKeysCallFromCode = (
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
        "Expected generated source text to include a variable initialized from an objectKeys call"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasObjectKeys: preferTsExtrasObjectKeysMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-keys metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-object-keys internal listener guards", () => {
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
                (await import("../src/rules/prefer-ts-extras-object-keys")) as {
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

            const privatePropertyKeysCallNode = {
                callee: {
                    computed: false,
                    object: {
                        name: "Object",
                        type: "Identifier",
                    },
                    property: {
                        name: "keys",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            callExpressionListener?.(privatePropertyKeysCallNode);

            expect(reportCalls).toHaveLength(0);
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-object-keys parse-safety guards", () => {
    it("fast-check: objectKeys replacement remains parseable across argument expression variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                objectKeysArgumentKindArbitrary,
                includeUnicodeBannerArbitrary,
                (argumentKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const argumentTemplate =
                        buildObjectKeysArgumentTemplate(argumentKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import { objectKeys } from "ts-extras";',
                        ...argumentTemplate.declarations,
                        `const keys = Object.keys(${argumentTemplate.argumentExpression});`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "objectKeys",
                        sourceText: generatedCode,
                        target: "Object.keys",
                    });

                    const { callExpression } =
                        parseObjectKeysCallFromCode(replacedCode);

                    expect(callExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        callExpression.callee.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(callExpression.callee.name).toBe("objectKeys");
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
                    messageId: "preferTsExtrasObjectKeys",
                },
                {
                    messageId: "preferTsExtrasObjectKeys",
                },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture Object.keys usage",
        },
        {
            code: inlineInvalidCode,
            errors: [{ messageId: "preferTsExtrasObjectKeys" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports direct Object.keys call",
            output: inlineInvalidOutputCode,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferTsExtrasObjectKeys" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Object.keys when objectKeys import is in scope",
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
            name: "ignores computed Object.keys member access",
        },
        {
            code: nonObjectReceiverValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores custom non-Object keys method",
        },
        {
            code: wrongPropertyValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.values usage",
        },
        {
            code: shadowedObjectBindingValidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Object.keys call when Object binding is shadowed",
        },
    ],
});
