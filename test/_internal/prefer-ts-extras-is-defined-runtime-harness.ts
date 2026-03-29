/**
 * @packageDocumentation
 * Runtime-executable fast-check harness for `prefer-ts-extras-is-defined`.
 */

import fc from "fast-check";

export type RuntimeIsDefinedCase = Readonly<{
    candidateValue: RuntimeScalar;
    comparedExpressionTemplateId: RuntimeComparedExpressionTemplateId;
    operator: RuntimeUndefinedComparisonOperator;
    orientation: RuntimeComparisonOrientation;
    toggleValue: boolean;
}>;

export type RuntimeScalar = boolean | null | number | string | undefined;

type RuntimeComparedExpressionTemplateId =
    | "functionCallExpression"
    | "getterMemberExpression"
    | "identifier"
    | "optionalChainingExpression";

type RuntimeComparisonOrientation =
    | "comparedExpressionOnLeft"
    | "comparedExpressionOnRight";

type RuntimeExecutionSnapshot = Readonly<{
    counter: number;
    evaluation: boolean;
}>;

type RuntimeUndefinedComparisonOperator = "!=" | "!==" | "==" | "===";

const runtimeIsDefinedImportStatement =
    'import { isDefined } from "ts-extras";';

const runtimeIsDefinedShimDeclaration =
    "const isDefined = (value) => value !== undefined;";

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
export const runtimeIsDefinedCaseArbitrary: fc.Arbitrary<unknown> = fc
    .tuple(
        runtimeScalarArbitrary,
        fc.constantFrom(
            "identifier",
            "optionalChainingExpression",
            "functionCallExpression",
            "getterMemberExpression"
        ),
        fc.constantFrom("!=", "!==", "==", "==="),
        fc.constantFrom(
            "comparedExpressionOnLeft",
            "comparedExpressionOnRight"
        ),
        fc.boolean()
    )
    .map(
        ([
            candidateValue,
            comparedExpressionTemplateId,
            operator,
            orientation,
            toggleValue,
        ]) => ({
            candidateValue,
            comparedExpressionTemplateId,
            operator,
            orientation,
            toggleValue,
        })
    )
    .map((generatedCase): unknown => generatedCase);

const formatRuntimeScalarLiteral = (value: RuntimeScalar): string =>
    value === undefined ? "undefined" : JSON.stringify(value);

const isRuntimeComparedExpressionTemplateId = (
    value: unknown
): value is RuntimeComparedExpressionTemplateId =>
    value === "functionCallExpression" ||
    value === "getterMemberExpression" ||
    value === "identifier" ||
    value === "optionalChainingExpression";

const isRuntimeUndefinedComparisonOperator = (
    value: unknown
): value is RuntimeUndefinedComparisonOperator =>
    value === "!=" || value === "!==" || value === "==" || value === "===";

const isRuntimeScalar = (value: unknown): value is RuntimeScalar =>
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string";

export const isRuntimeIsDefinedCase = (
    value: unknown
): value is RuntimeIsDefinedCase => {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const maybeRuntimeCase = value as Readonly<{
        candidateValue?: unknown;
        comparedExpressionTemplateId?: unknown;
        operator?: unknown;
        orientation?: unknown;
        toggleValue?: unknown;
    }>;

    return (
        isRuntimeScalar(maybeRuntimeCase.candidateValue) &&
        isRuntimeComparedExpressionTemplateId(
            maybeRuntimeCase.comparedExpressionTemplateId
        ) &&
        isRuntimeUndefinedComparisonOperator(maybeRuntimeCase.operator) &&
        (maybeRuntimeCase.orientation === "comparedExpressionOnLeft" ||
            maybeRuntimeCase.orientation === "comparedExpressionOnRight") &&
        typeof maybeRuntimeCase.toggleValue === "boolean"
    );
};

const getRuntimeComparedExpressionTemplate = (
    generatedCase: Readonly<RuntimeIsDefinedCase>
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
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

    if (
        generatedCase.comparedExpressionTemplateId ===
        "optionalChainingExpression"
    ) {
        const maybeContainerText = generatedCase.toggleValue
            ? "null"
            : `{ nested: { value: ${formatRuntimeScalarLiteral(generatedCase.candidateValue)} } }`;

        return {
            declarations: [
                "let counter = 0;",
                "const tap = () => { counter += 1; };",
                `const maybeContainer = ${maybeContainerText};`,
            ],
            expressionText: "(tap(), maybeContainer?.nested?.value)",
        };
    }

    return {
        declarations: [
            `const candidateValue = ${formatRuntimeScalarLiteral(generatedCase.candidateValue)};`,
        ],
        expressionText: "candidateValue",
    };
};

const formatRuntimeComparisonText = (
    generatedCase: Readonly<RuntimeIsDefinedCase>
): string => {
    const template = getRuntimeComparedExpressionTemplate(generatedCase);

    return generatedCase.orientation === "comparedExpressionOnLeft"
        ? `${template.expressionText} ${generatedCase.operator} undefined`
        : `undefined ${generatedCase.operator} ${template.expressionText}`;
};

export const buildRuntimeIsDefinedSourceText = (
    generatedCase: Readonly<RuntimeIsDefinedCase>
): string => {
    const template = getRuntimeComparedExpressionTemplate(generatedCase);

    return [
        runtimeIsDefinedImportStatement,
        ...template.declarations,
        `const evaluation = ${formatRuntimeComparisonText(generatedCase)};`,
        "void evaluation;",
    ].join("\n");
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

export const executeRuntimeIsDefinedSourceText = async (
    sourceText: string
): Promise<RuntimeExecutionSnapshot> => {
    const executableSourceText = replaceOrThrow({
        replacement: runtimeIsDefinedShimDeclaration,
        sourceText,
        target: runtimeIsDefinedImportStatement,
    });

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
