/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-is-present.test` behavior.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import {
    buildRuntimeLooseNullSourceText,
    buildRuntimeLooseNullSourceTextWithoutImport,
    executeRuntimeLooseNullSourceText,
    isRuntimeLooseNullCase,
    runtimeLooseNullCaseArbitrary,
} from "./_internal/prefer-ts-extras-is-present-runtime-harness";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { getSelectorAwareNodeListener } from "./_internal/selector-aware-listener";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleId = "prefer-ts-extras-is-present";
const docsDescription =
    "require ts-extras isPresent over inline nullish comparisons outside filter callbacks.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-present";
const preferTsExtrasIsPresentMessage =
    "Prefer `isPresent(value)` from `ts-extras` over inline nullish comparisons.";
const preferTsExtrasIsPresentNegatedMessage =
    "Prefer `!isPresent(value)` from `ts-extras` over inline nullish comparisons.";

const rule = getPluginRule(ruleId);
const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-ts-extras-is-present.valid.ts";
const invalidFixtureName = "prefer-ts-extras-is-present.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
const inlineValidThreeTermStrictPresentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && hasPermission && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue = maybeValue !== null && hasPermission;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue === undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue !== null;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonNullLiteralCode = [
    "declare const maybeValue: null | number | undefined;",
    "",
    "const isPresentValue = maybeValue !== 0 && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNonNullLeftLiteralCode = [
    "declare const maybeValue: null | number | undefined;",
    "",
    "const isPresentValue = 0 !== maybeValue && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithUndefinedAliasCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const undefinedAlias: undefined;",
    "",
    "const isPresentValue = maybeValue !== null && undefinedAlias !== maybeValue;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWithNestedOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && (maybeValue !== undefined || hasPermission);",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentDifferentComparedExpressionCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const otherValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null && otherValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictPresentWrongLogicalOperatorCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue !== null || maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictAbsentWrongLogicalOperatorCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null && maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidThreeTermStrictPresentComparableCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isPresentValue =",
    "    maybeValue !== null && (maybeValue !== undefined && hasPermission);",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidThreeTermStrictAbsentComparableCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue =",
    "    maybeValue === null || (maybeValue === undefined || hasPermission);",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictPresentFirstOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isPresentValue = maybeValue === null && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineValidStrictAbsentFirstOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue !== null || maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentDifferentComparedExpressionCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const otherValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || otherValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidThreeTermStrictAbsentCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue =",
    "    maybeValue === null || hasPermission || maybeValue === undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentWithNonBinaryTermCode = [
    "declare const maybeValue: null | string | undefined;",
    "declare const hasPermission: boolean;",
    "",
    "const isMissingValue = maybeValue === null || hasPermission;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentOperatorMismatchCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue !== undefined;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidStrictAbsentSameKindCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const isMissingValue = maybeValue === null || maybeValue === null;",
    "",
    "String(isMissingValue);",
].join("\n");
const inlineValidUndefinedOnLeftComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "const hasUndefinedValue = undefined == maybeValue;",
    "",
    "String(hasUndefinedValue);",
].join("\n");
const inlineValidNonNullishBinaryComparisonCode = [
    "declare const firstValue: string;",
    "declare const secondValue: string;",
    "",
    "const hasSameValue = firstValue === secondValue;",
    "",
    "String(hasSameValue);",
].join("\n");
const inlineInvalidStrictPresentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue !== null && maybeValue !== undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidStrictAbsentComparisonCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (maybeValue === null || maybeValue === undefined) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidMapCallbackStrictPresentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value !== null && value !== undefined);",
    "String(mapped.length);",
].join("\n");
const inlineInvalidMapCallbackStrictAbsentCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const mapped = values.map((value) => value === null || value === undefined);",
    "String(mapped.length);",
].join("\n");
const inlineValidFilterCallbackLogicalComparisonCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const presentValues = values.filter((value) => value !== null && value !== undefined);",
    "const missingValues = values.filter((value) => value === null || value === undefined);",
    "String(presentValues.length + missingValues.length);",
].join("\n");
const inlineValidFunctionExpressionFilterCallbackCode = [
    "const values: readonly (null | string | undefined)[] = ['alpha', null, undefined];",
    "const presentValues = values.filter(function (value) {",
    "    return value !== null && value !== undefined;",
    "});",
    "const missingValues = values.filter(function (value) {",
    "    return value === null || value === undefined;",
    "});",
    "String(presentValues.length + missingValues.length);",
].join("\n");
const inlineValidStrictPresentWithShadowedUndefinedBindingCode = [
    "declare const maybeValue: null | string | undefined;",
    "const undefined = Symbol('undefined');",
    "",
    "const isPresentValue = maybeValue !== null && maybeValue !== undefined;",
    "",
    "String(isPresentValue);",
].join("\n");
const inlineFixablePresentCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const hasValue = maybeValue != null;",
].join("\n");
const inlineFixablePresentOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const hasValue = isPresent(maybeValue);",
].join("\n");
const inlineFixableAbsentCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const isMissing = maybeValue == null;",
].join("\n");
const inlineFixableAbsentOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const maybeValue: null | string | undefined;",
    "const isMissing = !isPresent(maybeValue);",
].join("\n");
const inlineAstNodePresentInvalidCode = [
    'import type { TSESTree } from "@typescript-eslint/utils";',
    "",
    "const memberExpressionWithParent = {} as Readonly<TSESTree.MemberExpression> & {",
    "    parent?: null | Readonly<TSESTree.Node>;",
    "};",
    "const parentNode = memberExpressionWithParent.parent;",
    "const hasParent = parentNode != null;",
    "String(hasParent);",
].join("\n");
const inlineFixablePresentWithUnicodeAndEmojiCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "const hasValue = 候補値 != null; // keep comment 🚀",
].join("\n");
const inlineFixablePresentWithUnicodeAndEmojiOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";',
    "const hasValue = isPresent(候補値); // keep comment 🚀",
].join("\n");
const inlineFixableAbsentWithUnicodeAndEmojiCode = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    "const debugText = `glyphs 🧵 🧠 ☕ 你好`;",
    "const isMissing = 候補値 == null;",
].join("\n");
const inlineFixableAbsentWithUnicodeAndEmojiOutput = [
    'import { isPresent } from "ts-extras";',
    "",
    "declare const 候補値: null | string | undefined;",
    "const debugText = `glyphs 🧵 🧠 ☕ 你好`;",
    "const isMissing = !isPresent(候補値);",
].join("\n");
const inlineInvalidStrictPresentWithUndefinedOnLeftCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (undefined !== maybeValue && maybeValue !== null) {",
    "    String(maybeValue);",
    "}",
].join("\n");
const inlineInvalidStrictAbsentWithUndefinedOnLeftCode = [
    "declare const maybeValue: null | string | undefined;",
    "",
    "if (undefined === maybeValue || maybeValue === null) {",
    "    String(maybeValue);",
    "}",
].join("\n");

type ComparedExpressionTemplateId =
    | "awaitExpression"
    | "computedMemberExpression"
    | "conditionalExpression"
    | "functionCall"
    | "identifier"
    | "memberExpression"
    | "nestedComplexExpression"
    | "optionalChainingExpression"
    | "sequenceExpression"
    | "typeAssertion";

type ComparisonOrientation =
    | "comparedExpressionOnLeft"
    | "comparedExpressionOnRight";

type NullishKind = "null" | "undefined";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type GeneratedLooseBinaryCase = Readonly<{
    comparedExpressionTemplateId: ComparedExpressionTemplateId;
    hasUnicodeNoiseLine: boolean;
    nullishKind: NullishKind;
    operator: "!=" | "==";
    orientation: ComparisonOrientation;
}>;

type StrictLogicalCase = Readonly<{
    checkKind: "absent" | "present";
    leftKind: NullishKind;
    leftOrientation: ComparisonOrientation;
    rightComparedExpression: "maybeValue" | "otherValue";
    rightOrientation: ComparisonOrientation;
}>;

const strictLogicalCases: StrictLogicalCase[] = [];

const strictCheckKinds: readonly StrictLogicalCase["checkKind"][] = [
    "absent",
    "present",
];

const strictRightComparedExpressionKinds: readonly StrictLogicalCase["rightComparedExpression"][] =
    ["maybeValue", "otherValue"];

const nullishKinds: readonly NullishKind[] = ["null", "undefined"];

const comparisonOrientations: readonly ComparisonOrientation[] = [
    "comparedExpressionOnLeft",
    "comparedExpressionOnRight",
];

const comparedExpressionTemplateIds: readonly ComparedExpressionTemplateId[] = [
    "awaitExpression",
    "conditionalExpression",
    "identifier",
    "memberExpression",
    "nestedComplexExpression",
    "computedMemberExpression",
    "functionCall",
    "optionalChainingExpression",
    "typeAssertion",
    "sequenceExpression",
];

const looseOperators: readonly GeneratedLooseBinaryCase["operator"][] = [
    "!=",
    "==",
];

const unicodeNoiseOptions: readonly boolean[] = [false, true];

for (const checkKind of strictCheckKinds) {
    for (const leftKind of nullishKinds) {
        for (const leftOrientation of comparisonOrientations) {
            for (const rightComparedExpression of strictRightComparedExpressionKinds) {
                for (const rightOrientation of comparisonOrientations) {
                    strictLogicalCases.push({
                        checkKind,
                        leftKind,
                        leftOrientation,
                        rightComparedExpression,
                        rightOrientation,
                    });
                }
            }
        }
    }
}

const strictLogicalCaseArbitrary = fc.constantFrom(...strictLogicalCases);

const createGeneratedLooseBinaryCases = (
    nullishKind: NullishKind
): readonly GeneratedLooseBinaryCase[] => {
    const generatedCases: GeneratedLooseBinaryCase[] = [];

    for (const comparedExpressionTemplateId of comparedExpressionTemplateIds) {
        for (const hasUnicodeNoiseLine of unicodeNoiseOptions) {
            for (const operator of looseOperators) {
                for (const orientation of comparisonOrientations) {
                    generatedCases.push({
                        comparedExpressionTemplateId,
                        hasUnicodeNoiseLine,
                        nullishKind,
                        operator,
                        orientation,
                    });
                }
            }
        }
    }

    return generatedCases;
};

const binaryLooseNullCaseArbitrary = fc.constantFrom(
    ...createGeneratedLooseBinaryCases("null")
);

const binaryLooseSequenceNullCaseArbitrary = fc.constantFrom(
    ...createGeneratedLooseBinaryCases("null").filter(
        (generatedCase) =>
            generatedCase.comparedExpressionTemplateId === "sequenceExpression"
    )
);

const binaryLooseUndefinedCaseArbitrary = fc.constantFrom(
    ...createGeneratedLooseBinaryCases("undefined")
);

const isPresentImportAliasArbitrary = fc.constantFrom(
    "isPresentAlias",
    "presentValue",
    "safeIsPresent"
);

const hasUseStrictDirectiveArbitrary = fc.constantFrom(false, true);

const getComparedExpressionTemplate = (
    templateId: ComparedExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (templateId === "awaitExpression") {
        return {
            declarations: [
                "declare function getMaybePromiseValue(): Promise<null | string | undefined>;",
            ],
            expressionText: "(await getMaybePromiseValue())",
        };
    }

    if (templateId === "conditionalExpression") {
        return {
            declarations: [
                "declare const maybeToggle: boolean;",
                "declare const maybeValue: null | string | undefined;",
                "declare const otherValue: null | string | undefined;",
            ],
            expressionText: "(maybeToggle ? maybeValue : otherValue)",
        };
    }

    if (templateId === "identifier") {
        return {
            declarations: [
                "declare const maybeValue: null | string | undefined;",
            ],
            expressionText: "maybeValue",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const maybeContainer: { readonly current: null | string | undefined };",
            ],
            expressionText: "maybeContainer.current",
        };
    }

    if (templateId === "nestedComplexExpression") {
        return {
            declarations: [
                "declare const maybeToggle: boolean;",
                "declare const maybeContainer: { readonly nested?: { readonly value: null | string | undefined } | null } | null;",
                "declare function getMaybePromiseValue(): Promise<null | string | undefined>;",
                "declare const fallbackValue: null | string | undefined;",
            ],
            expressionText:
                "((maybeToggle ? maybeContainer?.nested?.value : (await getMaybePromiseValue())) ?? fallbackValue)",
        };
    }

    if (templateId === "computedMemberExpression") {
        return {
            declarations: [
                "declare const maybeValues: readonly (null | string | undefined)[];",
                "declare const index: number;",
            ],
            expressionText: "maybeValues[index]",
        };
    }

    if (templateId === "functionCall") {
        return {
            declarations: [
                "declare function getMaybeValue(): null | string | undefined;",
            ],
            expressionText: "getMaybeValue()",
        };
    }

    if (templateId === "optionalChainingExpression") {
        return {
            declarations: [
                "declare const maybeContainer: { readonly nested?: { readonly value: null | string | undefined } | null } | null;",
            ],
            expressionText: "maybeContainer?.nested?.value",
        };
    }

    if (templateId === "typeAssertion") {
        return {
            declarations: ["declare const maybeValue: unknown;"],
            expressionText: "(maybeValue as null | string | undefined)",
        };
    }

    return {
        declarations: [
            "declare function sideEffect(): void;",
            "declare const maybeValue: null | string | undefined;",
        ],
        expressionText: "(sideEffect(), maybeValue)",
    };
};

const getOppositeNullishKind = (nullishKind: NullishKind): NullishKind =>
    nullishKind === "null" ? "undefined" : "null";

const formatNullishLiteralText = (nullishKind: NullishKind): string =>
    nullishKind === "null" ? "null" : "undefined";

const formatNullishComparisonText = ({
    comparedExpression,
    kind,
    operator,
    orientation,
}: Readonly<{
    comparedExpression: "maybeValue" | "otherValue";
    kind: NullishKind;
    operator: "!==" | "===";
    orientation: ComparisonOrientation;
}>): string => {
    const nullishLiteralText = formatNullishLiteralText(kind);

    return orientation === "comparedExpressionOnLeft"
        ? `${comparedExpression} ${operator} ${nullishLiteralText}`
        : `${nullishLiteralText} ${operator} ${comparedExpression}`;
};

const isAstNodeLike = (value: unknown): value is TSESTree.Node => {
    if (typeof value !== "object" || value === null || !("type" in value)) {
        return false;
    }

    return typeof (value as Readonly<{ type?: unknown }>).type === "string";
};

const shouldSkipAstTraversalKey = (key: string): boolean =>
    key === "parent" || key === "tokens" || key === "comments";

const assignAstNodeParent = ({
    node,
    parent,
}: Readonly<{
    node: TSESTree.Node;
    parent: null | TSESTree.Node;
}>): void => {
    const nodeWithParent = node as { parent?: TSESTree.Node };

    if (parent === null) {
        delete nodeWithParent.parent;
    } else {
        nodeWithParent.parent = parent;
    }
};

const traverseAstChildValue = ({
    parent,
    value,
}: Readonly<{
    parent: TSESTree.Node;
    value: unknown;
}>): void => {
    if (Array.isArray(value)) {
        for (const arrayItem of value) {
            if (isAstNodeLike(arrayItem)) {
                linkAstParentChain({
                    node: arrayItem,
                    parent,
                });
            }
        }
    } else if (isAstNodeLike(value)) {
        linkAstParentChain({
            node: value,
            parent,
        });
    }
};

const linkAstParentChain = ({
    node,
    parent,
}: Readonly<{
    node: TSESTree.Node;
    parent: null | TSESTree.Node;
}>): void => {
    assignAstNodeParent({
        node,
        parent,
    });

    const nodeRecord = node as unknown as Record<string, unknown>;

    for (const [key, value] of Object.entries(nodeRecord)) {
        if (!shouldSkipAstTraversalKey(key)) {
            traverseAstChildValue({
                parent: node,
                value,
            });
        }
    }
};

const attachParentLinksToAst = (
    ast: Readonly<ReturnType<typeof parser.parseForESLint>["ast"]>
): ReturnType<typeof parser.parseForESLint>["ast"] => {
    const writableAst = ast as ReturnType<typeof parser.parseForESLint>["ast"];

    linkAstParentChain({
        node: writableAst,
        parent: null,
    });

    return writableAst;
};

const parseIfLogicalExpression = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    logicalExpression: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);
    const ast = attachParentLinksToAst(parsed.ast);
    let ifStatement: null | TSESTree.IfStatement = null;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.IfStatement) {
            ifStatement = statement;
            break;
        }
    }

    if (!ifStatement) {
        throw new Error("Expected generated code to include an if statement");
    }

    return {
        ast,
        logicalExpression: ifStatement.test,
    };
};

const parseVariableBinaryExpression = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    binaryExpression: TSESTree.BinaryExpression;
    binaryRange: readonly [number, number];
    comparedExpressionText: string;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);
    const ast = attachParentLinksToAst(parsed.ast);
    let binaryExpression: null | TSESTree.BinaryExpression = null;

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.init?.type === AST_NODE_TYPES.BinaryExpression
                ) {
                    binaryExpression = declaration.init;
                    break;
                }
            }
        }

        if (binaryExpression) {
            break;
        }
    }

    if (!binaryExpression) {
        throw new Error(
            "Expected generated code to include a variable binary expression"
        );
    }

    const comparedExpression =
        binaryExpression.left.type === AST_NODE_TYPES.Literal ||
        (binaryExpression.left.type === AST_NODE_TYPES.Identifier &&
            binaryExpression.left.name === "undefined")
            ? binaryExpression.right
            : binaryExpression.left;

    const binaryRange = binaryExpression.range;
    const comparedExpressionRange = comparedExpression.range;

    return {
        ast,
        binaryExpression,
        binaryRange,
        comparedExpressionText: code
            .slice(comparedExpressionRange[0], comparedExpressionRange[1])
            .trim(),
    };
};

type RuleReportDescriptor = Readonly<{
    fix?: TSESLint.ReportFixFunction;
    messageId?: string;
}>;

type TextEdit = Readonly<{
    end: number;
    start: number;
    text: string;
}>;

const parseSingleVariableInitializerExpression = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    initializer: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    const ast = attachParentLinksToAst(parsed.ast);

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init !== null) {
                    return {
                        ast,
                        initializer: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        "Expected generated source text to include a variable declarator initializer"
    );
};

const parseVariableInitializerExpressionByName = ({
    sourceText,
    variableName,
}: Readonly<{
    sourceText: string;
    variableName: string;
}>): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    initializer: TSESTree.Expression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    const ast = attachParentLinksToAst(parsed.ast);

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (
                    declaration.id.type === AST_NODE_TYPES.Identifier &&
                    declaration.id.name === variableName &&
                    declaration.init !== null
                ) {
                    return {
                        ast,
                        initializer: declaration.init,
                    };
                }
            }
        }
    }

    throw new Error(
        `Expected generated source text to include initializer for variable: ${variableName}`
    );
};

const extractCallExpressionFromInitializer = (
    initializer: Readonly<TSESTree.Expression>
): TSESTree.CallExpression => {
    if (initializer.type === AST_NODE_TYPES.CallExpression) {
        return initializer;
    }

    if (
        initializer.type === AST_NODE_TYPES.UnaryExpression &&
        initializer.operator === "!" &&
        initializer.argument.type === AST_NODE_TYPES.CallExpression
    ) {
        return initializer.argument;
    }

    throw new TypeError(
        "Expected initializer to be a call expression or a negated call expression"
    );
};

const findNamedImportSpecifier = ({
    ast,
    importedName,
    sourceModuleName,
}: Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    importedName: string;
    sourceModuleName: string;
}>): null | TSESTree.ImportSpecifier => {
    for (const statement of ast.body) {
        if (
            statement.type === AST_NODE_TYPES.ImportDeclaration &&
            statement.source.value === sourceModuleName
        ) {
            for (const specifier of statement.specifiers) {
                if (
                    specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                    specifier.imported.type === AST_NODE_TYPES.Identifier &&
                    specifier.imported.name === importedName &&
                    specifier.local.type === AST_NODE_TYPES.Identifier
                ) {
                    (
                        specifier as {
                            parent?: TSESTree.ImportDeclaration;
                        }
                    ).parent = statement;
                    return specifier;
                }
            }
        }
    }

    return null;
};

const countNamedImportSpecifiersInSource = ({
    importedName,
    sourceModuleName,
    sourceText,
}: Readonly<{
    importedName: string;
    sourceModuleName: string;
    sourceText: string;
}>): number => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    let importSpecifierCount = 0;

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.ImportDeclaration &&
            statement.source.value === sourceModuleName
        ) {
            for (const specifier of statement.specifiers) {
                if (
                    specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                    specifier.imported.type === AST_NODE_TYPES.Identifier &&
                    specifier.imported.name === importedName
                ) {
                    importSpecifierCount += 1;
                }
            }
        }
    }

    return importSpecifierCount;
};

const extractRangeFromUnknownNode = (
    node: unknown
): null | readonly [number, number] => {
    if (typeof node !== "object" || node === null || !("range" in node)) {
        return null;
    }

    const nodeRange = (node as Readonly<{ range?: readonly [number, number] }>)
        .range;

    if (
        nodeRange === undefined ||
        typeof nodeRange[0] !== "number" ||
        typeof nodeRange[1] !== "number"
    ) {
        return null;
    }

    return nodeRange;
};

const addScopeBinding = ({
    definitionNode,
    definitionType,
    name,
    scopeBindings,
}: Readonly<{
    definitionNode: TSESTree.Node;
    definitionType: string;
    name: string;
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
}>): void => {
    if (name.length === 0 || scopeBindings.has(name)) {
        return;
    }

    scopeBindings.set(name, {
        defs: [
            {
                node: definitionNode,
                type: definitionType,
            },
        ],
    } as unknown as TSESLint.Scope.Variable);
};

const addImportScopeBindings = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.ImportDeclaration;
}>): void => {
    for (const specifier of statement.specifiers) {
        if (specifier.local.type === AST_NODE_TYPES.Identifier) {
            addScopeBinding({
                definitionNode: specifier,
                definitionType: "ImportBinding",
                name: specifier.local.name,
                scopeBindings,
            });
        }
    }
};

const addVariableScopeBindings = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.VariableDeclaration;
}>): void => {
    for (const declaration of statement.declarations) {
        if (declaration.id.type === AST_NODE_TYPES.Identifier) {
            addScopeBinding({
                definitionNode: declaration.id,
                definitionType: "Variable",
                name: declaration.id.name,
                scopeBindings,
            });
        }
    }
};

const addFunctionScopeBinding = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.FunctionDeclaration;
}>): void => {
    if (statement.id?.type === AST_NODE_TYPES.Identifier) {
        addScopeBinding({
            definitionNode: statement.id,
            definitionType: "FunctionName",
            name: statement.id.name,
            scopeBindings,
        });
    }
};

const addClassScopeBinding = ({
    scopeBindings,
    statement,
}: Readonly<{
    scopeBindings: Map<string, TSESLint.Scope.Variable>;
    statement: TSESTree.ClassDeclaration;
}>): void => {
    if (statement.id?.type === AST_NODE_TYPES.Identifier) {
        addScopeBinding({
            definitionNode: statement.id,
            definitionType: "ClassName",
            name: statement.id.name,
            scopeBindings,
        });
    }
};

const collectTopLevelRuntimeScopeBindings = (
    ast: Readonly<ReturnType<typeof parser.parseForESLint>["ast"]>
): Map<string, TSESLint.Scope.Variable> => {
    const scopeBindings = new Map<string, TSESLint.Scope.Variable>();

    for (const statement of ast.body) {
        if (statement.type === AST_NODE_TYPES.ImportDeclaration) {
            addImportScopeBindings({
                scopeBindings,
                statement,
            });
        }

        if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
            addFunctionScopeBinding({
                scopeBindings,
                statement,
            });
        }

        if (statement.type === AST_NODE_TYPES.ClassDeclaration) {
            addClassScopeBinding({
                scopeBindings,
                statement,
            });
        }

        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            addVariableScopeBindings({
                scopeBindings,
                statement,
            });
        }
    }

    return scopeBindings;
};

const createRuleContextForSource = ({
    ast,
    reportCalls,
    settings,
    sourceText,
}: Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    reportCalls: RuleReportDescriptor[];
    settings?: unknown;
    sourceText: string;
}>): Parameters<typeof rule.create>[0] => {
    const importSpecifier = findNamedImportSpecifier({
        ast,
        importedName: "isPresent",
        sourceModuleName: "ts-extras",
    });

    const scopeBindings = collectTopLevelRuntimeScopeBindings(ast);

    if (
        importSpecifier?.local.type === AST_NODE_TYPES.Identifier &&
        importSpecifier.local.name.length > 0
    ) {
        scopeBindings.set(importSpecifier.local.name, {
            defs: [
                {
                    node: importSpecifier,
                    type: "ImportBinding",
                },
            ],
        } as unknown as TSESLint.Scope.Variable);
    }

    const scope = {
        set: scopeBindings,
        upper: null,
    };

    return {
        filename: "src/example.ts",
        report: (descriptor: RuleReportDescriptor) => {
            reportCalls.push(descriptor);
        },
        settings,
        sourceCode: {
            ast,
            getScope: () => scope as unknown as Readonly<TSESLint.Scope.Scope>,
            getText(node: unknown): string {
                const nodeRange = extractRangeFromUnknownNode(node);

                if (nodeRange === null) {
                    return "";
                }

                return sourceText.slice(nodeRange[0], nodeRange[1]);
            },
        },
    } as unknown as Parameters<typeof rule.create>[0];
};

const normalizeRuleFixes = (
    fixResult: unknown
): readonly Readonly<TSESLint.RuleFix>[] => {
    if (fixResult === null || fixResult === undefined) {
        return [];
    }

    if (Array.isArray(fixResult)) {
        return fixResult as readonly Readonly<TSESLint.RuleFix>[];
    }

    return [fixResult as Readonly<TSESLint.RuleFix>];
};

const invokeReportFixToTextEdits = (
    reportFix: TSESLint.ReportFixFunction
): readonly TextEdit[] => {
    const fixer = {
        insertTextAfter(node: Readonly<TSESTree.Node>, text: string) {
            const nodeRange = node.range;

            return {
                range: [nodeRange[1], nodeRange[1]],
                text,
            } as const;
        },
        insertTextBeforeRange(range: readonly [number, number], text: string) {
            return {
                range,
                text,
            } as const;
        },
        replaceText(node: Readonly<TSESTree.Node>, text: string) {
            return {
                range: node.range,
                text,
            } as const;
        },
    } as unknown as Readonly<TSESLint.RuleFixer>;

    const fixResult = reportFix(fixer);
    const normalizedFixes = normalizeRuleFixes(fixResult);

    return normalizedFixes.map((fix) => ({
        end: fix.range[1],
        start: fix.range[0],
        text: fix.text,
    }));
};

const assertTextEditsDoNotOverlap = (
    textEdits: readonly Readonly<TextEdit>[]
): void => {
    for (const [firstIndex, firstEdit] of textEdits.entries()) {
        for (const [secondIndex, secondEdit] of textEdits.entries()) {
            if (firstIndex < secondIndex) {
                const doNotOverlap =
                    firstEdit.end <= secondEdit.start ||
                    secondEdit.end <= firstEdit.start;

                expect(doNotOverlap).toBeTruthy();
            }
        }
    }
};

const applyTextEdits = ({
    sourceText,
    textEdits,
}: Readonly<{
    sourceText: string;
    textEdits: readonly Readonly<TextEdit>[];
}>): string => {
    let updatedSourceText = sourceText;

    const remainingTextEdits = [...textEdits];

    while (remainingTextEdits.length > 0) {
        let greatestIndex = 0;

        for (let index = 1; index < remainingTextEdits.length; index += 1) {
            const currentEdit = remainingTextEdits[index];
            const greatestEdit = remainingTextEdits[greatestIndex];

            if (
                currentEdit !== undefined &&
                greatestEdit !== undefined &&
                (currentEdit.start > greatestEdit.start ||
                    (currentEdit.start === greatestEdit.start &&
                        currentEdit.end > greatestEdit.end))
            ) {
                greatestIndex = index;
            }
        }

        const [textEdit] = remainingTextEdits.splice(greatestIndex, 1);
        if (textEdit === undefined) {
            throw new TypeError("Expected a text edit while applying fixes");
        }

        updatedSourceText =
            updatedSourceText.slice(0, textEdit.start) +
            textEdit.text +
            updatedSourceText.slice(textEdit.end);
    }

    return updatedSourceText;
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferTsExtrasIsPresent: preferTsExtrasIsPresentMessage,
        preferTsExtrasIsPresentNegated: preferTsExtrasIsPresentNegatedMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-is-present metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

describe("prefer-ts-extras-is-present internal filter guards", () => {
    const getNodeText = (
        node: Readonly<{
            name?: string;
            raw?: string;
            text?: string;
            value?: unknown;
        }>
    ): string => {
        if (typeof node.text === "string") {
            return node.text;
        }

        if (typeof node.name === "string") {
            return node.name;
        }

        if (typeof node.raw === "string") {
            return node.raw;
        }

        if (node.value === null) {
            return "null";
        }

        return "";
    };

    it("reports strict checks for non-function filter arguments", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
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
                    getText: getNodeText,
                },
            });

            const logicalExpressionListener = getSelectorAwareNodeListener(
                listeners as Readonly<Record<string, unknown>>,
                "LogicalExpression"
            );

            expect(logicalExpressionListener).toBeTypeOf("function");

            const comparedIdentifier = {
                name: "maybeValue",
                text: "maybeValue",
                type: "Identifier",
            };
            const leftBinaryNode = {
                left: comparedIdentifier,
                operator: "!==",
                right: {
                    raw: "null",
                    type: "Literal",
                    value: null,
                },
                type: "BinaryExpression",
            };
            const rightBinaryNode = {
                left: comparedIdentifier,
                operator: "!==",
                right: {
                    name: "undefined",
                    text: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            };
            const logicalNode = {
                left: leftBinaryNode,
                operator: "&&",
                right: rightBinaryNode,
                type: "LogicalExpression",
            };
            const filterCallNode = {
                arguments: [logicalNode],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "Identifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            (leftBinaryNode as { parent?: unknown }).parent = logicalNode;
            (rightBinaryNode as { parent?: unknown }).parent = logicalNode;
            (logicalNode as { parent?: unknown }).parent = filterCallNode;

            logicalExpressionListener?.(logicalNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferTsExtrasIsPresent",
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("does not treat private filter-like call as filter callback", async () => {
        const reportCalls: { messageId?: string }[] = [];

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
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
                    getText: getNodeText,
                },
            });

            const logicalExpressionListener = getSelectorAwareNodeListener(
                listeners as Readonly<Record<string, unknown>>,
                "LogicalExpression"
            );

            expect(logicalExpressionListener).toBeTypeOf("function");

            const comparedIdentifier = {
                name: "maybeValue",
                text: "maybeValue",
                type: "Identifier",
            };
            const leftBinaryNode = {
                left: comparedIdentifier,
                operator: "===",
                right: {
                    raw: "null",
                    type: "Literal",
                    value: null,
                },
                type: "BinaryExpression",
            };
            const rightBinaryNode = {
                left: comparedIdentifier,
                operator: "===",
                right: {
                    name: "undefined",
                    text: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            };
            const logicalNode = {
                left: leftBinaryNode,
                operator: "||",
                right: rightBinaryNode,
                type: "LogicalExpression",
            };
            const returnNode = {
                argument: logicalNode,
                type: "ReturnStatement",
            };
            const functionCallbackNode = {
                body: {
                    body: [returnNode],
                    type: "BlockStatement",
                },
                params: [
                    {
                        name: "value",
                        type: "Identifier",
                    },
                ],
                type: "FunctionExpression",
            };
            const privateFilterCallNode = {
                arguments: [functionCallbackNode],
                callee: {
                    computed: false,
                    object: {
                        name: "values",
                        type: "Identifier",
                    },
                    property: {
                        name: "filter",
                        type: "PrivateIdentifier",
                    },
                    type: "MemberExpression",
                },
                type: "CallExpression",
            };

            (leftBinaryNode as { parent?: unknown }).parent = logicalNode;
            (rightBinaryNode as { parent?: unknown }).parent = logicalNode;
            (logicalNode as { parent?: unknown }).parent = returnNode;
            (returnNode as { parent?: unknown }).parent = functionCallbackNode;
            (functionCallbackNode as { parent?: unknown }).parent =
                privateFilterCallNode;

            logicalExpressionListener?.(logicalNode);

            expect(reportCalls).toHaveLength(1);
            expect(reportCalls[0]).toMatchObject({
                messageId: "preferTsExtrasIsPresentNegated",
            });
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: reports only strict present/absent checks over the same compared expression", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Set<string>(),
                    createSafeValueArgumentFunctionCallFix: () => null,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            LogicalExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(strictLogicalCaseArbitrary, (generatedCase) => {
                    const comparisonOperator =
                        generatedCase.checkKind === "present" ? "!==" : "===";
                    const logicalOperator =
                        generatedCase.checkKind === "present" ? "&&" : "||";
                    const rightKind = getOppositeNullishKind(
                        generatedCase.leftKind
                    );
                    const firstComparisonText = formatNullishComparisonText({
                        comparedExpression: "maybeValue",
                        kind: generatedCase.leftKind,
                        operator: comparisonOperator,
                        orientation: generatedCase.leftOrientation,
                    });
                    const secondComparisonText = formatNullishComparisonText({
                        comparedExpression:
                            generatedCase.rightComparedExpression,
                        kind: rightKind,
                        operator: comparisonOperator,
                        orientation: generatedCase.rightOrientation,
                    });

                    const code = [
                        "declare const maybeValue: null | string | undefined;",
                        "declare const otherValue: null | string | undefined;",
                        "",
                        `if (${firstComparisonText} ${logicalOperator} ${secondComparisonText}) {`,
                        "    String(maybeValue);",
                        "}",
                    ].join("\n");

                    const { ast, logicalExpression } =
                        parseIfLogicalExpression(code);
                    const reportCalls: Readonly<{ messageId?: string }>[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename: "src/example.ts",
                        report: (
                            descriptor: Readonly<{ messageId?: string }>
                        ) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
                                    return "";
                                }

                                const nodeRange = (
                                    node as Readonly<{
                                        range?: readonly [number, number];
                                    }>
                                ).range;

                                if (!nodeRange) {
                                    return "";
                                }

                                const [start, end] = nodeRange;
                                return code.slice(start, end);
                            },
                        },
                    });

                    const logicalExpressionListener =
                        getSelectorAwareNodeListener(
                            listeners as Readonly<Record<string, unknown>>,
                            "LogicalExpression"
                        );

                    logicalExpressionListener?.(logicalExpression);

                    const shouldReport =
                        generatedCase.rightComparedExpression === "maybeValue";
                    const expectedMessageId =
                        generatedCase.checkKind === "present"
                            ? "preferTsExtrasIsPresent"
                            : "preferTsExtrasIsPresentNegated";

                    expect(reportCalls).toHaveLength(shouldReport ? 1 : 0);
                    expect(reportCalls[0]?.messageId).toBe(
                        shouldReport ? expectedMessageId : undefined
                    );
                }),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: loose null comparisons report with parseable isPresent replacement text", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueArgumentFunctionCallFix:
                        createSafeValueArgumentFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                    createSafeValueArgumentFunctionCallFixMock.mockClear();

                    const template = getComparedExpressionTemplate(
                        generatedCase.comparedExpressionTemplateId
                    );
                    const nullishLiteralText = formatNullishLiteralText(
                        generatedCase.nullishKind
                    );
                    const comparisonText =
                        generatedCase.orientation === "comparedExpressionOnLeft"
                            ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                            : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;
                    const code = [
                        ...template.declarations,
                        generatedCase.hasUnicodeNoiseLine
                            ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                            : "",
                        `const evaluation = ${comparisonText};`,
                        "String(evaluation);",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const {
                        ast,
                        binaryExpression,
                        binaryRange,
                        comparedExpressionText,
                    } = parseVariableBinaryExpression(code);
                    const reportCalls: Readonly<{
                        fix?: unknown;
                        messageId?: string;
                    }>[] = [];

                    const listeners = authoredRuleModule.default.create({
                        filename: "src/example.ts",
                        report: (
                            descriptor: Readonly<{
                                fix?: unknown;
                                messageId?: string;
                            }>
                        ) => {
                            reportCalls.push(descriptor);
                        },
                        sourceCode: {
                            ast,
                            getText(node: unknown): string {
                                if (
                                    typeof node !== "object" ||
                                    node === null ||
                                    !("range" in node)
                                ) {
                                    return "";
                                }

                                const nodeRange = (
                                    node as Readonly<{
                                        range?: readonly [number, number];
                                    }>
                                ).range;

                                if (!nodeRange) {
                                    return "";
                                }

                                return code.slice(nodeRange[0], nodeRange[1]);
                            },
                        },
                    });

                    listeners.BinaryExpression?.(binaryExpression);

                    expect(reportCalls).toHaveLength(1);
                    expect(reportCalls[0]).toMatchObject({
                        messageId:
                            generatedCase.operator === "!="
                                ? "preferTsExtrasIsPresent"
                                : "preferTsExtrasIsPresentNegated",
                    });

                    if (
                        createSafeValueArgumentFunctionCallFixMock.mock.calls
                            .length > 0
                    ) {
                        expect(
                            createSafeValueArgumentFunctionCallFixMock
                        ).toHaveBeenCalledTimes(1);
                    }

                    const callText = `isPresent(${comparedExpressionText})`;
                    const replacementText =
                        generatedCase.operator === "=="
                            ? `!${callText}`
                            : callText;
                    const fixedCode =
                        code.slice(0, binaryRange[0]) +
                        replacementText +
                        code.slice(binaryRange[1]);

                    expect(() => {
                        parser.parseForESLint(fixedCode, parserOptions);
                    }).not.toThrow();
                }),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });

    it("fast-check: rule-level loose null autofix remains parseable and emits no second-pass binary reports", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                const template = getComparedExpressionTemplate(
                    generatedCase.comparedExpressionTemplateId
                );
                const nullishLiteralText = formatNullishLiteralText(
                    generatedCase.nullishKind
                );
                const comparisonText =
                    generatedCase.orientation === "comparedExpressionOnLeft"
                        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                const sourceText = [
                    'import { isPresent } from "ts-extras";',
                    ...template.declarations,
                    generatedCase.hasUnicodeNoiseLine
                        ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                        : "",
                    `const evaluation = ${comparisonText};`,
                    "String(evaluation);",
                ]
                    .filter((line) => line.length > 0)
                    .join("\n");

                const { ast: firstPassAst, binaryExpression } =
                    parseVariableBinaryExpression(sourceText);
                const firstPassReports: RuleReportDescriptor[] = [];

                const firstPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: firstPassAst,
                        reportCalls: firstPassReports,
                        sourceText,
                    })
                );

                firstPassListeners.BinaryExpression?.(binaryExpression);

                expect(firstPassReports).toHaveLength(1);
                expect(firstPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const firstPassFix = firstPassReports[0]?.fix;

                expect(firstPassFix).toBeTypeOf("function");

                if (firstPassFix === undefined) {
                    throw new Error(
                        "Expected first-pass report to include a fixer"
                    );
                }

                const firstPassTextEdits =
                    invokeReportFixToTextEdits(firstPassFix);

                expect(firstPassTextEdits).toHaveLength(1);

                assertTextEditsDoNotOverlap(firstPassTextEdits);

                const firstPassFixedCode = applyTextEdits({
                    sourceText,
                    textEdits: firstPassTextEdits,
                });

                expect(
                    countNamedImportSpecifiersInSource({
                        importedName: "isPresent",
                        sourceModuleName: "ts-extras",
                        sourceText: firstPassFixedCode,
                    })
                ).toBe(1);

                expect(() => {
                    parser.parseForESLint(firstPassFixedCode, parserOptions);
                }).not.toThrow();

                const {
                    ast: secondPassAst,
                    initializer: secondPassInitializer,
                } =
                    parseSingleVariableInitializerExpression(
                        firstPassFixedCode
                    );

                expect(secondPassInitializer.type).not.toBe(
                    AST_NODE_TYPES.BinaryExpression
                );

                const secondPassReports: RuleReportDescriptor[] = [];
                const secondPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: secondPassAst,
                        reportCalls: secondPassReports,
                        sourceText: firstPassFixedCode,
                    })
                );

                if (
                    secondPassInitializer.type ===
                    AST_NODE_TYPES.BinaryExpression
                ) {
                    secondPassListeners.BinaryExpression?.(
                        secondPassInitializer
                    );
                }

                expect(secondPassReports).toHaveLength(0);
            }),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: rule-level loose null autofix preserves aliased isPresent imports and remains second-pass stable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                binaryLooseNullCaseArbitrary,
                isPresentImportAliasArbitrary,
                (generatedCase, localAlias) => {
                    const template = getComparedExpressionTemplate(
                        generatedCase.comparedExpressionTemplateId
                    );
                    const nullishLiteralText = formatNullishLiteralText(
                        generatedCase.nullishKind
                    );
                    const comparisonText =
                        generatedCase.orientation === "comparedExpressionOnLeft"
                            ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                            : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                    const sourceText = [
                        `import { isPresent as ${localAlias} } from "ts-extras";`,
                        ...template.declarations,
                        generatedCase.hasUnicodeNoiseLine
                            ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                            : "",
                        `const evaluation = ${comparisonText};`,
                        "String(evaluation);",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const { ast: firstPassAst, binaryExpression } =
                        parseVariableBinaryExpression(sourceText);
                    const firstPassReports: RuleReportDescriptor[] = [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        })
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    expect(firstPassReports).toHaveLength(1);

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected first-pass report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(1);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const replacementCallExpression =
                        extractCallExpressionFromInitializer(
                            secondPassInitializer
                        );

                    expect(replacementCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        replacementCallExpression.callee.type !==
                        AST_NODE_TYPES.Identifier
                    ) {
                        throw new TypeError(
                            "Expected replacement call to use an identifier callee"
                        );
                    }

                    expect(replacementCallExpression.callee.name).toBe(
                        localAlias
                    );

                    expect(secondPassInitializer.type).not.toBe(
                        AST_NODE_TYPES.BinaryExpression
                    );

                    const secondPassReports: RuleReportDescriptor[] = [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        })
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: rule-level loose null autofix inserts missing import once and remains second-pass stable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                binaryLooseNullCaseArbitrary,
                hasUseStrictDirectiveArbitrary,
                (generatedCase, hasUseStrictDirective) => {
                    const template = getComparedExpressionTemplate(
                        generatedCase.comparedExpressionTemplateId
                    );
                    const nullishLiteralText = formatNullishLiteralText(
                        generatedCase.nullishKind
                    );
                    const comparisonText =
                        generatedCase.orientation === "comparedExpressionOnLeft"
                            ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                            : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                    const sourceText = [
                        hasUseStrictDirective ? '"use strict";' : "",
                        ...template.declarations,
                        generatedCase.hasUnicodeNoiseLine
                            ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                            : "",
                        `const evaluation = ${comparisonText};`,
                        "String(evaluation);",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const { ast: firstPassAst, binaryExpression } =
                        parseVariableBinaryExpression(sourceText);
                    const firstPassReports: RuleReportDescriptor[] = [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        })
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    expect(firstPassReports).toHaveLength(1);

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected first-pass report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    const fixedAst = parser.parseForESLint(
                        firstPassFixedCode,
                        parserOptions
                    ).ast;

                    if (hasUseStrictDirective) {
                        const firstStatement = fixedAst.body[0];
                        const secondStatement = fixedAst.body[1];

                        expect(firstStatement?.type).toBe(
                            AST_NODE_TYPES.ExpressionStatement
                        );
                        expect(secondStatement?.type).toBe(
                            AST_NODE_TYPES.ImportDeclaration
                        );

                        if (
                            firstStatement?.type !==
                            AST_NODE_TYPES.ExpressionStatement
                        ) {
                            throw new TypeError(
                                "Expected first statement to remain a directive expression"
                            );
                        }

                        expect(firstStatement.directive).toBe("use strict");
                    }

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const replacementCallExpression =
                        extractCallExpressionFromInitializer(
                            secondPassInitializer
                        );

                    expect(replacementCallExpression.callee.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        replacementCallExpression.callee.type !==
                        AST_NODE_TYPES.Identifier
                    ) {
                        throw new TypeError(
                            "Expected replacement call to use an identifier callee"
                        );
                    }

                    expect(replacementCallExpression.callee.name).toBe(
                        "isPresent"
                    );

                    expect(secondPassInitializer.type).not.toBe(
                        AST_NODE_TYPES.BinaryExpression
                    );

                    const secondPassReports: RuleReportDescriptor[] = [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        })
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: loose undefined binary comparisons do not trigger isPresent fixes", async () => {
        expect.hasAssertions();

        try {
            vi.resetModules();

            const createSafeValueArgumentFunctionCallFixMock = vi.fn(
                () => "FIX"
            );

            vi.doMock(import("../src/_internal/typed-rule.js"), () => ({
                createTypedRule: createTypedRuleSelectorAwarePassThrough,
                getTypedRuleServices: () => ({
                    checker: {},
                    parserServices: {},
                }),
                getTypedRuleServicesOrUndefined: () => undefined,
                hasTypeServices: () => false,
                isGlobalUndefinedIdentifier: (
                    _context: unknown,
                    expression: Readonly<{ name?: string; type: string }>
                ) =>
                    expression.type === "Identifier" &&
                    expression.name === "undefined",
            }));

            vi.doMock(
                import("../src/_internal/imported-value-symbols.js"),
                () => ({
                    collectDirectNamedValueImportsFromSource: () =>
                        new Map<string, ReadonlySet<string>>(),
                    createSafeValueArgumentFunctionCallFix:
                        createSafeValueArgumentFunctionCallFixMock,
                })
            );

            const authoredRuleModule =
                (await import("../src/rules/prefer-ts-extras-is-present")) as {
                    default: {
                        create: (context: unknown) => {
                            BinaryExpression?: (node: unknown) => void;
                        };
                    };
                };

            fc.assert(
                fc.property(
                    binaryLooseUndefinedCaseArbitrary,
                    (generatedCase) => {
                        createSafeValueArgumentFunctionCallFixMock.mockClear();

                        const template = getComparedExpressionTemplate(
                            generatedCase.comparedExpressionTemplateId
                        );
                        const comparisonText =
                            generatedCase.orientation ===
                            "comparedExpressionOnLeft"
                                ? `${template.expressionText} ${generatedCase.operator} undefined`
                                : `undefined ${generatedCase.operator} ${template.expressionText}`;
                        const code = [
                            ...template.declarations,
                            `const evaluation = ${comparisonText};`,
                            "String(evaluation);",
                        ].join("\n");

                        const { ast, binaryExpression } =
                            parseVariableBinaryExpression(code);
                        const reportCalls: Readonly<{
                            fix?: unknown;
                            messageId?: string;
                        }>[] = [];

                        const listeners = authoredRuleModule.default.create({
                            filename: "src/example.ts",
                            report: (
                                descriptor: Readonly<{
                                    fix?: unknown;
                                    messageId?: string;
                                }>
                            ) => {
                                reportCalls.push(descriptor);
                            },
                            sourceCode: {
                                ast,
                                getText(node: unknown): string {
                                    if (
                                        typeof node !== "object" ||
                                        node === null ||
                                        !("range" in node)
                                    ) {
                                        return "";
                                    }

                                    const nodeRange = (
                                        node as Readonly<{
                                            range?: readonly [number, number];
                                        }>
                                    ).range;

                                    if (!nodeRange) {
                                        return "";
                                    }

                                    return code.slice(
                                        nodeRange[0],
                                        nodeRange[1]
                                    );
                                },
                            },
                        });

                        listeners.BinaryExpression?.(binaryExpression);

                        expect(reportCalls).toHaveLength(0);
                        expect(
                            createSafeValueArgumentFunctionCallFixMock
                        ).not.toHaveBeenCalled();
                    }
                ),
                fastCheckRunConfig.default
            );
        } finally {
            vi.doUnmock("../src/_internal/imported-value-symbols.js");
            vi.doUnmock("../src/_internal/typed-rule.js");
            vi.resetModules();
        }
    });
});

describe("prefer-ts-extras-is-present sequence expression autofix guard", () => {
    it("fast-check: sequence-expression loose null autofix preserves sequence argument structure and remains second-pass stable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                binaryLooseSequenceNullCaseArbitrary,
                (generatedCase) => {
                    const template = getComparedExpressionTemplate(
                        generatedCase.comparedExpressionTemplateId
                    );
                    const nullishLiteralText = formatNullishLiteralText(
                        generatedCase.nullishKind
                    );
                    const comparisonText =
                        generatedCase.orientation === "comparedExpressionOnLeft"
                            ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                            : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                    const sourceText = [
                        'import { isPresent } from "ts-extras";',
                        ...template.declarations,
                        generatedCase.hasUnicodeNoiseLine
                            ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                            : "",
                        `const evaluation = ${comparisonText};`,
                        "String(evaluation);",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const { ast: firstPassAst, binaryExpression } =
                        parseVariableBinaryExpression(sourceText);
                    const firstPassReports: RuleReportDescriptor[] = [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        })
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    expect(firstPassReports).toHaveLength(1);

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected first-pass report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(1);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const replacementCallExpression =
                        extractCallExpressionFromInitializer(
                            secondPassInitializer
                        );

                    const [firstArgument] = replacementCallExpression.arguments;

                    expect(firstArgument?.type).toBe(
                        AST_NODE_TYPES.SequenceExpression
                    );

                    if (
                        firstArgument?.type !==
                        AST_NODE_TYPES.SequenceExpression
                    ) {
                        throw new TypeError(
                            "Expected replacement call argument to remain a SequenceExpression"
                        );
                    }

                    expect(firstArgument.expressions).toHaveLength(2);

                    const [firstSequenceOperand, secondSequenceOperand] =
                        firstArgument.expressions;

                    expect(firstSequenceOperand?.type).toBe(
                        AST_NODE_TYPES.CallExpression
                    );
                    expect(secondSequenceOperand?.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        secondSequenceOperand?.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(secondSequenceOperand.name).toBe("maybeValue");
                    }

                    expect(secondPassInitializer.type).not.toBe(
                        AST_NODE_TYPES.BinaryExpression
                    );

                    const secondPassReports: RuleReportDescriptor[] = [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        })
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe("prefer-ts-extras-is-present runtime equivalence guard", () => {
    it("fast-check: loose nullish comparison handling preserves runtime behavior and undefined ignore semantics for executable compared-expression templates", async () => {
        expect.hasAssertions();

        await fc.assert(
            fc.asyncProperty(
                runtimeLooseNullCaseArbitrary,
                async (generatedCase) => {
                    if (!isRuntimeLooseNullCase(generatedCase)) {
                        throw new TypeError(
                            "Expected runtime loose null fast-check case to match RuntimeLooseNullCase"
                        );
                    }

                    const sourceText =
                        buildRuntimeLooseNullSourceText(generatedCase);
                    const { ast: firstPassAst, binaryExpression } =
                        parseVariableBinaryExpression(sourceText);
                    const firstPassReports: RuleReportDescriptor[] = [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        })
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    if (generatedCase.nullishKind === "undefined") {
                        expect(firstPassReports).toHaveLength(0);

                        return;
                    }

                    expect(firstPassReports).toHaveLength(1);
                    expect(firstPassReports[0]?.messageId).toBe(
                        generatedCase.operator === "!="
                            ? "preferTsExtrasIsPresent"
                            : "preferTsExtrasIsPresentNegated"
                    );

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected runtime equivalence report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(1);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    const originalExecutionSnapshot =
                        await executeRuntimeLooseNullSourceText(sourceText);
                    const fixedExecutionSnapshot =
                        await executeRuntimeLooseNullSourceText(
                            firstPassFixedCode
                        );

                    expect(fixedExecutionSnapshot).toStrictEqual(
                        originalExecutionSnapshot
                    );

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const secondPassReports: RuleReportDescriptor[] = [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        })
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });

    it("fast-check: missing ts-extras import autofix preserves runtime behavior and remains second-pass stable for executable templates", async () => {
        expect.hasAssertions();

        await fc.assert(
            fc.asyncProperty(
                runtimeLooseNullCaseArbitrary,
                hasUseStrictDirectiveArbitrary,
                async (generatedCase, hasUseStrictDirective) => {
                    if (!isRuntimeLooseNullCase(generatedCase)) {
                        throw new TypeError(
                            "Expected runtime loose null fast-check case to match RuntimeLooseNullCase"
                        );
                    }

                    const sourceText =
                        buildRuntimeLooseNullSourceTextWithoutImport({
                            generatedCase,
                            hasUseStrictDirective,
                        });
                    const { ast: firstPassAst, binaryExpression } =
                        parseVariableBinaryExpression(sourceText);
                    const firstPassReports: RuleReportDescriptor[] = [];

                    const firstPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: firstPassAst,
                            reportCalls: firstPassReports,
                            sourceText,
                        })
                    );

                    firstPassListeners.BinaryExpression?.(binaryExpression);

                    if (generatedCase.nullishKind === "undefined") {
                        expect(firstPassReports).toHaveLength(0);
                        expect(
                            countNamedImportSpecifiersInSource({
                                importedName: "isPresent",
                                sourceModuleName: "ts-extras",
                                sourceText,
                            })
                        ).toBe(0);

                        return;
                    }

                    expect(firstPassReports).toHaveLength(1);

                    const firstPassFix = firstPassReports[0]?.fix;

                    expect(firstPassFix).toBeTypeOf("function");

                    if (firstPassFix === undefined) {
                        throw new Error(
                            "Expected runtime import-insertion report to include a fixer"
                        );
                    }

                    const firstPassTextEdits =
                        invokeReportFixToTextEdits(firstPassFix);

                    expect(firstPassTextEdits).toHaveLength(2);

                    assertTextEditsDoNotOverlap(firstPassTextEdits);

                    const firstPassFixedCode = applyTextEdits({
                        sourceText,
                        textEdits: firstPassTextEdits,
                    });

                    expect(() => {
                        parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        );
                    }).not.toThrow();

                    expect(
                        countNamedImportSpecifiersInSource({
                            importedName: "isPresent",
                            sourceModuleName: "ts-extras",
                            sourceText: firstPassFixedCode,
                        })
                    ).toBe(1);

                    if (hasUseStrictDirective) {
                        const fixedAst = parser.parseForESLint(
                            firstPassFixedCode,
                            parserOptions
                        ).ast;
                        const firstStatement = fixedAst.body[0];
                        const secondStatement = fixedAst.body[1];

                        expect(firstStatement?.type).toBe(
                            AST_NODE_TYPES.ExpressionStatement
                        );
                        expect(secondStatement?.type).toBe(
                            AST_NODE_TYPES.ImportDeclaration
                        );

                        if (
                            firstStatement?.type !==
                            AST_NODE_TYPES.ExpressionStatement
                        ) {
                            throw new TypeError(
                                "Expected first statement to remain a directive expression"
                            );
                        }

                        expect(firstStatement.directive).toBe("use strict");
                    }

                    const originalExecutionSnapshot =
                        await executeRuntimeLooseNullSourceText(sourceText);
                    const fixedExecutionSnapshot =
                        await executeRuntimeLooseNullSourceText(
                            firstPassFixedCode
                        );

                    expect(fixedExecutionSnapshot).toStrictEqual(
                        originalExecutionSnapshot
                    );

                    const {
                        ast: secondPassAst,
                        initializer: secondPassInitializer,
                    } = parseVariableInitializerExpressionByName({
                        sourceText: firstPassFixedCode,
                        variableName: "evaluation",
                    });

                    const secondPassReports: RuleReportDescriptor[] = [];
                    const secondPassListeners = rule.create(
                        createRuleContextForSource({
                            ast: secondPassAst,
                            reportCalls: secondPassReports,
                            sourceText: firstPassFixedCode,
                        })
                    );

                    if (
                        secondPassInitializer.type ===
                        AST_NODE_TYPES.BinaryExpression
                    ) {
                        secondPassListeners.BinaryExpression?.(
                            secondPassInitializer
                        );
                    }

                    expect(secondPassReports).toHaveLength(0);
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe("prefer-ts-extras-is-present local isPresent shadowing", () => {
    it("fast-check: rule-level loose null reports but emits no unsafe fixer when local isPresent binding exists", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                const template = getComparedExpressionTemplate(
                    generatedCase.comparedExpressionTemplateId
                );
                const nullishLiteralText = formatNullishLiteralText(
                    generatedCase.nullishKind
                );
                const comparisonText =
                    generatedCase.orientation === "comparedExpressionOnLeft"
                        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                const sourceText = [
                    "const isPresent = (value: unknown): boolean => Boolean(value);",
                    ...template.declarations,
                    generatedCase.hasUnicodeNoiseLine
                        ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                        : "",
                    `const evaluation = ${comparisonText};`,
                    "String(evaluation);",
                ]
                    .filter((line) => line.length > 0)
                    .join("\n");

                const { ast: firstPassAst, binaryExpression } =
                    parseVariableBinaryExpression(sourceText);
                const firstPassReports: RuleReportDescriptor[] = [];

                const firstPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: firstPassAst,
                        reportCalls: firstPassReports,
                        sourceText,
                    })
                );

                firstPassListeners.BinaryExpression?.(binaryExpression);

                expect(firstPassReports).toHaveLength(1);
                expect(firstPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const firstPassReport = firstPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(firstPassReport.fix ?? undefined).toBeUndefined();

                expect(() => {
                    parser.parseForESLint(sourceText, parserOptions);
                }).not.toThrow();

                const { ast: secondPassAst, binaryExpression: secondBinary } =
                    parseVariableBinaryExpression(sourceText);
                const secondPassReports: RuleReportDescriptor[] = [];

                const secondPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: secondPassAst,
                        reportCalls: secondPassReports,
                        sourceText,
                    })
                );

                secondPassListeners.BinaryExpression?.(secondBinary);

                expect(secondPassReports).toHaveLength(1);
                expect(secondPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const secondPassReport = secondPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(secondPassReport.fix ?? undefined).toBeUndefined();
            }),
            fastCheckRunConfig.default
        );
    });
});

describe("prefer-ts-extras-is-present non-ts-extras isPresent import guard", () => {
    it("fast-check: rule-level loose null reports but emits no unsafe fixer when isPresent comes from a different module", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                const template = getComparedExpressionTemplate(
                    generatedCase.comparedExpressionTemplateId
                );
                const nullishLiteralText = formatNullishLiteralText(
                    generatedCase.nullishKind
                );
                const comparisonText =
                    generatedCase.orientation === "comparedExpressionOnLeft"
                        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                const sourceText = [
                    'import { isPresent } from "external-runtime-helpers";',
                    ...template.declarations,
                    generatedCase.hasUnicodeNoiseLine
                        ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                        : "",
                    `const evaluation = ${comparisonText};`,
                    "String(evaluation);",
                ]
                    .filter((line) => line.length > 0)
                    .join("\n");

                const { ast: firstPassAst, binaryExpression } =
                    parseVariableBinaryExpression(sourceText);
                const firstPassReports: RuleReportDescriptor[] = [];

                const firstPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: firstPassAst,
                        reportCalls: firstPassReports,
                        sourceText,
                    })
                );

                firstPassListeners.BinaryExpression?.(binaryExpression);

                expect(firstPassReports).toHaveLength(1);
                expect(firstPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const firstPassReport = firstPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(firstPassReport.fix ?? undefined).toBeUndefined();

                expect(() => {
                    parser.parseForESLint(sourceText, parserOptions);
                }).not.toThrow();

                const { ast: secondPassAst, binaryExpression: secondBinary } =
                    parseVariableBinaryExpression(sourceText);
                const secondPassReports: RuleReportDescriptor[] = [];

                const secondPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: secondPassAst,
                        reportCalls: secondPassReports,
                        sourceText,
                    })
                );

                secondPassListeners.BinaryExpression?.(secondBinary);

                expect(secondPassReports).toHaveLength(1);
                expect(secondPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const secondPassReport = secondPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(secondPassReport.fix ?? undefined).toBeUndefined();
            }),
            fastCheckRunConfig.default
        );
    });
});

describe("prefer-ts-extras-is-present import insertion setting guard", () => {
    it("fast-check: with disableImportInsertionFixes, loose null reports and yields no fix edits when isPresent import is missing", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                const template = getComparedExpressionTemplate(
                    generatedCase.comparedExpressionTemplateId
                );
                const nullishLiteralText = formatNullishLiteralText(
                    generatedCase.nullishKind
                );
                const comparisonText =
                    generatedCase.orientation === "comparedExpressionOnLeft"
                        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                const sourceText = [
                    ...template.declarations,
                    generatedCase.hasUnicodeNoiseLine
                        ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                        : "",
                    `const evaluation = ${comparisonText};`,
                    "String(evaluation);",
                ]
                    .filter((line) => line.length > 0)
                    .join("\n");

                const { ast: firstPassAst, binaryExpression } =
                    parseVariableBinaryExpression(sourceText);
                const firstPassReports: RuleReportDescriptor[] = [];

                const firstPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: firstPassAst,
                        reportCalls: firstPassReports,
                        settings: {
                            typefest: {
                                disableImportInsertionFixes: true,
                            },
                        },
                        sourceText,
                    })
                );

                firstPassListeners.BinaryExpression?.(binaryExpression);

                expect(firstPassReports).toHaveLength(1);
                expect(firstPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const firstPassReport = firstPassReports[0] as Readonly<{
                    fix?: null | TSESLint.ReportFixFunction;
                }>;
                const firstPassFix = firstPassReport.fix;

                expect(firstPassFix).toBeTypeOf("function");

                if (firstPassFix === undefined || firstPassFix === null) {
                    throw new TypeError(
                        "Expected first-pass report to provide a fix function"
                    );
                }

                const firstPassTextEdits =
                    invokeReportFixToTextEdits(firstPassFix);

                expect(firstPassTextEdits).toHaveLength(0);

                expect(() => {
                    parser.parseForESLint(sourceText, parserOptions);
                }).not.toThrow();

                const { ast: secondPassAst, binaryExpression: secondBinary } =
                    parseVariableBinaryExpression(sourceText);
                const secondPassReports: RuleReportDescriptor[] = [];

                const secondPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: secondPassAst,
                        reportCalls: secondPassReports,
                        settings: {
                            typefest: {
                                disableImportInsertionFixes: true,
                            },
                        },
                        sourceText,
                    })
                );

                secondPassListeners.BinaryExpression?.(secondBinary);

                expect(secondPassReports).toHaveLength(1);
                expect(secondPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const secondPassReport = secondPassReports[0] as Readonly<{
                    fix?: null | TSESLint.ReportFixFunction;
                }>;
                const secondPassFix = secondPassReport.fix;

                expect(secondPassFix).toBeTypeOf("function");

                if (secondPassFix === undefined || secondPassFix === null) {
                    throw new TypeError(
                        "Expected second-pass report to provide a fix function"
                    );
                }

                const secondPassTextEdits =
                    invokeReportFixToTextEdits(secondPassFix);

                expect(secondPassTextEdits).toHaveLength(0);
            }),
            fastCheckRunConfig.default
        );
    });
});

describe("prefer-ts-extras-is-present global autofix-off setting guard", () => {
    it("fast-check: with disableAllAutofixes, loose null reports without exposing fix callbacks", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(binaryLooseNullCaseArbitrary, (generatedCase) => {
                const template = getComparedExpressionTemplate(
                    generatedCase.comparedExpressionTemplateId
                );
                const nullishLiteralText = formatNullishLiteralText(
                    generatedCase.nullishKind
                );
                const comparisonText =
                    generatedCase.orientation === "comparedExpressionOnLeft"
                        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
                        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;

                const sourceText = [
                    'import { isPresent } from "ts-extras";',
                    ...template.declarations,
                    generatedCase.hasUnicodeNoiseLine
                        ? 'const debugText = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻  ";'
                        : "",
                    `const evaluation = ${comparisonText};`,
                    "String(evaluation);",
                ]
                    .filter((line) => line.length > 0)
                    .join("\n");

                const { ast: firstPassAst, binaryExpression } =
                    parseVariableBinaryExpression(sourceText);
                const firstPassReports: RuleReportDescriptor[] = [];

                const firstPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: firstPassAst,
                        reportCalls: firstPassReports,
                        settings: {
                            typefest: {
                                disableAllAutofixes: true,
                            },
                        },
                        sourceText,
                    })
                );

                firstPassListeners.BinaryExpression?.(binaryExpression);

                expect(firstPassReports).toHaveLength(1);
                expect(firstPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const firstPassReport = firstPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(firstPassReport.fix ?? undefined).toBeUndefined();

                expect(() => {
                    parser.parseForESLint(sourceText, parserOptions);
                }).not.toThrow();

                const { ast: secondPassAst, binaryExpression: secondBinary } =
                    parseVariableBinaryExpression(sourceText);
                const secondPassReports: RuleReportDescriptor[] = [];

                const secondPassListeners = rule.create(
                    createRuleContextForSource({
                        ast: secondPassAst,
                        reportCalls: secondPassReports,
                        settings: {
                            typefest: {
                                disableAllAutofixes: true,
                            },
                        },
                        sourceText,
                    })
                );

                secondPassListeners.BinaryExpression?.(secondBinary);

                expect(secondPassReports).toHaveLength(1);
                expect(secondPassReports[0]?.messageId).toBe(
                    generatedCase.operator === "!="
                        ? "preferTsExtrasIsPresent"
                        : "preferTsExtrasIsPresentNegated"
                );

                const secondPassReport = secondPassReports[0] as Readonly<{
                    fix?: unknown;
                }>;

                expect(secondPassReport.fix ?? undefined).toBeUndefined();
            }),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [
                { messageId: "preferTsExtrasIsPresent" },
                { messageId: "preferTsExtrasIsPresent" },
                { messageId: "preferTsExtrasIsPresentNegated" },
                { messageId: "preferTsExtrasIsPresent" },
                { messageId: "preferTsExtrasIsPresent" },
                { messageId: "preferTsExtrasIsPresentNegated" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture strict present and absent comparisons",
            output: null,
        },
        {
            code: inlineInvalidStrictPresentComparisonCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict present conjunction check",
        },
        {
            code: inlineInvalidStrictAbsentComparisonCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict absent disjunction check",
        },
        {
            code: inlineInvalidMapCallbackStrictPresentCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict present check inside map callback",
        },
        {
            code: inlineInvalidMapCallbackStrictAbsentCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict absent check inside map callback",
        },
        {
            code: inlineFixablePresentCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null inequality when isPresent import is in scope",
            output: inlineFixablePresentOutput,
        },
        {
            code: inlineFixableAbsentCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null equality when isPresent import is in scope",
            output: inlineFixableAbsentOutput,
        },
        {
            code: inlineFixablePresentWithUnicodeAndEmojiCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null inequality without disturbing unicode, emoji, or nerd-font glyph text",
            output: inlineFixablePresentWithUnicodeAndEmojiOutput,
        },
        {
            code: inlineFixableAbsentWithUnicodeAndEmojiCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes loose null equality in files containing unicode-rich template literals",
            output: inlineFixableAbsentWithUnicodeAndEmojiOutput,
        },
        {
            code: inlineInvalidStrictPresentWithUndefinedOnLeftCode,
            errors: [{ messageId: "preferTsExtrasIsPresent" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict present conjunction when undefined is on the left",
        },
        {
            code: inlineInvalidStrictAbsentWithUndefinedOnLeftCode,
            errors: [{ messageId: "preferTsExtrasIsPresentNegated" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports strict absent disjunction when undefined is on the left",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts fixture-safe patterns",
        },
        {
            code: inlineValidThreeTermStrictPresentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores three-term strict present conjunction",
        },
        {
            code: inlineValidStrictPresentWithNonBinaryTermCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present conjunction with non-binary term",
        },
        {
            code: inlineValidStrictPresentOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check with operator mismatch",
        },
        {
            code: inlineValidStrictPresentSameKindCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check using repeated null branch",
        },
        {
            code: inlineValidStrictPresentWithNonNullLiteralCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check using non-null literal on the right",
        },
        {
            code: inlineValidStrictPresentWithNonNullLeftLiteralCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check using non-null literal on the left",
        },
        {
            code: inlineValidStrictPresentWithUndefinedAliasCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check using non-undefined identifier alias",
        },
        {
            code: inlineValidStrictPresentWithNestedOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present checks with nested opposite logical operators",
        },
        {
            code: inlineValidStrictPresentDifferentComparedExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check when compared expressions differ",
        },
        {
            code: inlineValidStrictPresentWrongLogicalOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present comparisons joined by disjunction",
        },
        {
            code: inlineValidThreeTermStrictPresentComparableCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores three-term strict present chain with comparable terms",
        },
        {
            code: inlineValidStrictPresentFirstOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present check when first operator is strict equality",
        },
        {
            code: inlineValidThreeTermStrictAbsentCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores three-term strict absent disjunction",
        },
        {
            code: inlineValidStrictAbsentWrongLogicalOperatorCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent comparisons joined by conjunction",
        },
        {
            code: inlineValidThreeTermStrictAbsentComparableCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores three-term strict absent chain with comparable terms",
        },
        {
            code: inlineValidStrictAbsentFirstOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent check when first operator is strict inequality",
        },
        {
            code: inlineValidStrictAbsentDifferentComparedExpressionCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent check when compared expressions differ",
        },
        {
            code: inlineValidStrictAbsentWithNonBinaryTermCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent disjunction with non-binary term",
        },
        {
            code: inlineValidStrictAbsentOperatorMismatchCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent check with operator mismatch",
        },
        {
            code: inlineValidStrictAbsentSameKindCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict absent check using repeated null branch",
        },
        {
            code: inlineValidUndefinedOnLeftComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores undefined comparison with literal on left",
        },
        {
            code: inlineValidNonNullishBinaryComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-nullish binary comparison",
        },
        {
            code: inlineValidFilterCallbackLogicalComparisonCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict checks inside filter callbacks",
        },
        {
            code: inlineValidFunctionExpressionFilterCallbackCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict checks inside function-expression filter callbacks",
        },
        {
            code: inlineValidStrictPresentWithShadowedUndefinedBindingCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores strict present checks when undefined binding is shadowed",
        },
        {
            code: inlineAstNodePresentInvalidCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores AST-node loose null inequalities",
        },
    ],
});
