/**
 * @packageDocumentation
 * Runtime-executable fast-check harness for `prefer-ts-extras-is-present`.
 */

import fc from "fast-check";

export type RuntimeComparedExpressionTemplateId =
    | "conditionalExpression"
    | "functionCallExpression"
    | "getterMemberExpression"
    | "identifier"
    | "nullishCoalescingExpression"
    | "optionalChainingExpression"
    | "sequenceExpression";

export type RuntimeLooseNullCase = Readonly<{
    candidateValue: RuntimeScalar;
    comparedExpressionTemplateId: RuntimeComparedExpressionTemplateId;
    fallbackValue: RuntimeScalar;
    nullishKind: RuntimeNullishKind;
    operator: "!=" | "==";
    orientation: RuntimeComparisonOrientation;
    secondaryValue: RuntimeScalar;
    toggleValue: boolean;
}>;

export type RuntimeScalar = boolean | null | number | string | undefined;

type RuntimeComparisonOrientation =
    | "comparedExpressionOnLeft"
    | "comparedExpressionOnRight";

type RuntimeExecutionSnapshot = Readonly<{
    counter: number;
    evaluation: boolean;
}>;

type RuntimeNullishKind = "null" | "undefined";

const runtimeIsPresentImportStatement =
    'import { isPresent } from "ts-extras";';

const runtimeIsPresentShimDeclaration =
    "const isPresent = (value) => value !== null && value !== undefined;";

const runtimeScalarArbitrary = fc.constantFrom(
    null,
    undefined,
    "",
    "runtime",
    0,
    1,
    true,
    false
);

// eslint-disable-next-line total-functions/no-hidden-type-assertions -- fast-check tuple composition intentionally relies on inferred literal generics to keep case-shape precision.
export const runtimeLooseNullCaseArbitrary: fc.Arbitrary<unknown> = fc
    .tuple(
        runtimeScalarArbitrary,
        fc.constantFrom(
            "identifier",
            "optionalChainingExpression",
            "conditionalExpression",
            "functionCallExpression",
            "getterMemberExpression",
            "sequenceExpression",
            "nullishCoalescingExpression"
        ),
        runtimeScalarArbitrary,
        fc.constantFrom("null", "undefined"),
        fc.constantFrom("!=", "=="),
        fc.constantFrom(
            "comparedExpressionOnLeft",
            "comparedExpressionOnRight"
        ),
        runtimeScalarArbitrary,
        fc.boolean()
    )
    .map(
        ([
            candidateValue,
            comparedExpressionTemplateId,
            fallbackValue,
            nullishKind,
            operator,
            orientation,
            secondaryValue,
            toggleValue,
        ]) => ({
            candidateValue,
            comparedExpressionTemplateId,
            fallbackValue,
            nullishKind,
            operator,
            orientation,
            secondaryValue,
            toggleValue,
        })
    )
    .map((generatedCase): unknown => generatedCase);

const formatRuntimeScalarLiteral = (value: RuntimeScalar): string =>
    value === undefined ? "undefined" : JSON.stringify(value);

const isRuntimeComparedExpressionTemplateId = (
    value: unknown
): value is RuntimeComparedExpressionTemplateId =>
    value === "conditionalExpression" ||
    value === "functionCallExpression" ||
    value === "getterMemberExpression" ||
    value === "identifier" ||
    value === "nullishCoalescingExpression" ||
    value === "optionalChainingExpression" ||
    value === "sequenceExpression";

const isRuntimeLooseNullOperator = (
    value: unknown
): value is RuntimeLooseNullCase["operator"] =>
    value === "!=" || value === "==";

const isRuntimeScalar = (value: unknown): value is RuntimeScalar =>
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string";

export const isRuntimeLooseNullCase = (
    value: unknown
): value is RuntimeLooseNullCase => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const maybeRuntimeCase = value as Readonly<{
        candidateValue?: unknown;
        comparedExpressionTemplateId?: unknown;
        fallbackValue?: unknown;
        nullishKind?: unknown;
        operator?: unknown;
        orientation?: unknown;
        secondaryValue?: unknown;
        toggleValue?: unknown;
    }>;

    return (
        isRuntimeScalar(maybeRuntimeCase.candidateValue) &&
        isRuntimeComparedExpressionTemplateId(
            maybeRuntimeCase.comparedExpressionTemplateId
        ) &&
        isRuntimeScalar(maybeRuntimeCase.fallbackValue) &&
        (maybeRuntimeCase.nullishKind === "null" ||
            maybeRuntimeCase.nullishKind === "undefined") &&
        isRuntimeLooseNullOperator(maybeRuntimeCase.operator) &&
        (maybeRuntimeCase.orientation === "comparedExpressionOnLeft" ||
            maybeRuntimeCase.orientation === "comparedExpressionOnRight") &&
        isRuntimeScalar(maybeRuntimeCase.secondaryValue) &&
        typeof maybeRuntimeCase.toggleValue === "boolean"
    );
};

const getRuntimeComparedExpressionTemplate = (
    generatedCase: Readonly<RuntimeLooseNullCase>
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (
        generatedCase.comparedExpressionTemplateId === "conditionalExpression"
    ) {
        return {
            declarations: [
                `const toggle = ${String(generatedCase.toggleValue)};`,
                `const leftValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
                `const rightValue = ${formatRuntimeScalarLiteral(generatedCase.secondaryValue)};`,
            ],
            expressionText: "(toggle ? leftValue : rightValue)",
        };
    }

    if (
        generatedCase.comparedExpressionTemplateId === "functionCallExpression"
    ) {
        return {
            declarations: [
                "let counter = 0;",
                `const candidateValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
                "const readCandidateValue = () => { counter += 1; return candidateValue; };",
            ],
            expressionText: "readCandidateValue()",
        };
    }

    if (
        generatedCase.comparedExpressionTemplateId === "getterMemberExpression"
    ) {
        return {
            declarations: [
                "let counter = 0;",
                `const candidateValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
                "const valueHolder = { get current() { counter += 1; return candidateValue; } };",
            ],
            expressionText: "valueHolder.current",
        };
    }

    if (generatedCase.comparedExpressionTemplateId === "identifier") {
        return {
            declarations: [
                `const candidateValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
            ],
            expressionText: "candidateValue",
        };
    }

    if (
        generatedCase.comparedExpressionTemplateId ===
        "optionalChainingExpression"
    ) {
        const maybeContainerText = generatedCase.toggleValue
            ? "null"
            : `{ nested: { value: ${formatRuntimeScalarLiteral(generatedCase.candidateValue)} } }`;

        return {
            declarations: [`const maybeContainer = ${maybeContainerText};`],
            expressionText: "maybeContainer?.nested?.value",
        };
    }

    if (generatedCase.comparedExpressionTemplateId === "sequenceExpression") {
        return {
            declarations: [
                "let counter = 0;",
                "const tap = () => { counter += 1; };",
                `const candidateValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
            ],
            expressionText: "(tap(), candidateValue)",
        };
    }

    return {
        declarations: [
            `const primaryValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
            `const fallbackValue = ${formatRuntimeScalarLiteral(generatedCase.fallbackValue)};`,
        ],
        expressionText: "(primaryValue ?? fallbackValue)",
    };
};

const formatRuntimeComparisonText = (
    generatedCase: Readonly<RuntimeLooseNullCase>
): string => {
    const template = getRuntimeComparedExpressionTemplate(generatedCase);
    const nullishLiteralText =
        generatedCase.nullishKind === "null" ? "null" : "undefined";

    return generatedCase.orientation === "comparedExpressionOnLeft"
        ? `${template.expressionText} ${generatedCase.operator} ${nullishLiteralText}`
        : `${nullishLiteralText} ${generatedCase.operator} ${template.expressionText}`;
};

export const buildRuntimeLooseNullSourceText = (
    generatedCase: Readonly<RuntimeLooseNullCase>
): string => {
    const template = getRuntimeComparedExpressionTemplate(generatedCase);

    return [
        runtimeIsPresentImportStatement,
        ...template.declarations,
        `const evaluation = ${formatRuntimeComparisonText(generatedCase)};`,
        "void evaluation;",
    ].join("\n");
};

export const buildRuntimeLooseNullSourceTextWithoutImport = ({
    generatedCase,
    hasUseStrictDirective,
}: Readonly<{
    generatedCase: Readonly<RuntimeLooseNullCase>;
    hasUseStrictDirective: boolean;
}>): string => {
    const template = getRuntimeComparedExpressionTemplate(generatedCase);

    return [
        hasUseStrictDirective ? '"use strict";' : "",
        ...template.declarations,
        `const evaluation = ${formatRuntimeComparisonText(generatedCase)};`,
        "void evaluation;",
    ]
        .filter((line) => line.length > 0)
        .join("\n");
};

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
            `Expected runtime source text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const isRuntimeExecutionSnapshot = (
    value: unknown
): value is RuntimeExecutionSnapshot => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const maybeSnapshot = value as Readonly<{
        counter?: unknown;
        evaluation?: unknown;
    }>;

    return (
        typeof maybeSnapshot.counter === "number" &&
        typeof maybeSnapshot.evaluation === "boolean"
    );
};

let runtimeExecutionSequence = 0;

const executeRuntimeSourceText = async (
    executableSourceText: string
): Promise<unknown> => {
    const moduleSourceText = [
        executableSourceText,
        "export default {",
        'counter: typeof counter === "number" ? counter : 0,',
        "evaluation,",
        "};",
    ].join("\n");
    const moduleSpecifier = `data:text/javascript;charset=utf-8,${encodeURIComponent(moduleSourceText)}#runtime-${String(runtimeExecutionSequence)}`;

    runtimeExecutionSequence += 1;

    // eslint-disable-next-line no-unsanitized/method -- Test-only harness imports a repository-controlled, URI-encoded data module to validate autofix runtime equivalence.
    const moduleNamespace = (await import(moduleSpecifier)) as Readonly<{
        default: unknown;
    }>;

    return moduleNamespace.default;
};

export const executeRuntimeLooseNullSourceText = async (
    sourceText: string
): Promise<RuntimeExecutionSnapshot> => {
    const executableSourceText = sourceText.includes(
        runtimeIsPresentImportStatement
    )
        ? replaceOrThrow({
              replacement: runtimeIsPresentShimDeclaration,
              sourceText,
              target: runtimeIsPresentImportStatement,
          })
        : `${runtimeIsPresentShimDeclaration}\n${sourceText}`;

    const executionResult = await executeRuntimeSourceText(
        [executableSourceText].join("\n")
    );

    if (!isRuntimeExecutionSnapshot(executionResult)) {
        throw new TypeError(
            "Expected runtime execution to return a typed evaluation/counter snapshot"
        );
    }

    return {
        counter: executionResult.counter,
        evaluation: executionResult.evaluation,
    };
};
