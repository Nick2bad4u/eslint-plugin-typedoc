/**
 * @packageDocumentation
 * Helpers for determining whether expressions/types are array-like in typed
 * rule analysis.
 */
import type { TSESTree } from "@typescript-eslint/utils";
import type ts from "typescript";

import {
    isTypeAnyType,
    isTypeArrayTypeOrUnionOfArrayTypes,
    isTypeUnknownType,
} from "@typescript-eslint/type-utils";
import { isDefined } from "ts-extras";

import { getParentNode } from "./ast-node.js";
import { getConstrainedTypeAtLocationWithFallback } from "./constrained-type-at-location.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { setContainsValue } from "./set-membership.js";
import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseConstraintType,
    getTypeCheckerIsArrayTypeResult,
    getTypeCheckerIsTupleTypeResult,
} from "./type-checker-compat.js";
import { recordTypedPathPrefilterEvaluation } from "./typed-path-telemetry.js";

/**
 * Shared inputs required to evaluate whether an ESTree expression is array-like
 * using TypeScript type information.
 */
interface ArrayLikeExpressionCheckerOptions {
    /**
     * TypeScript checker instance used for type resolution.
     */
    readonly checker: ts.TypeChecker;

    /**
     * Parser services map for converting ESTree nodes to TypeScript nodes.
     */
    readonly parserServices: {
        readonly esTreeNodeToTSNodeMap: {
            readonly get: (key: Readonly<TSESTree.Node>) => ts.Node | undefined;
        };
    };

    /**
     * Optional file path used by telemetry counters.
     */
    readonly telemetryFilePath?: string;

    /**
     * How union members should be matched.
     *
     * @default "some"
     */
    readonly unionMatchMode?: UnionArrayLikeMatchMode;
}

/**
 * Determines how union member types are evaluated for array-likeness.
 */
type UnionArrayLikeMatchMode = "every" | "some";

const evaluateIsArrayLikeType = ({
    candidateType,
    checker,
    resolutionCache,
    seenTypes,
    unionMatchMode,
}: Readonly<{
    candidateType: Readonly<ts.Type>;
    checker: Readonly<ts.TypeChecker>;
    resolutionCache: Map<Readonly<ts.Type>, boolean>;
    seenTypes: Set<Readonly<ts.Type>>;
    unionMatchMode: UnionArrayLikeMatchMode;
}>): boolean => {
    const cachedResult = resolutionCache.get(candidateType);

    if (isDefined(cachedResult)) {
        return cachedResult;
    }

    if (setContainsValue(seenTypes, candidateType)) {
        return false;
    }

    seenTypes.add(candidateType);

    if (isTypeAnyType(candidateType) || isTypeUnknownType(candidateType)) {
        resolutionCache.set(candidateType, false);

        return false;
    }

    if (isTypeArrayTypeOrUnionOfArrayTypes(candidateType, checker)) {
        resolutionCache.set(candidateType, true);

        return true;
    }

    if (
        getTypeCheckerIsArrayTypeResult(checker, candidateType) === true ||
        getTypeCheckerIsTupleTypeResult(checker, candidateType) === true
    ) {
        resolutionCache.set(candidateType, true);

        return true;
    }

    if (candidateType.isUnion()) {
        const isArrayLike =
            unionMatchMode === "every"
                ? candidateType.types.every((partType) =>
                      evaluateIsArrayLikeType({
                          candidateType: partType,
                          checker,
                          resolutionCache,
                          seenTypes,
                          unionMatchMode,
                      })
                  )
                : candidateType.types.some((partType) =>
                      evaluateIsArrayLikeType({
                          candidateType: partType,
                          checker,
                          resolutionCache,
                          seenTypes,
                          unionMatchMode,
                      })
                  );

        resolutionCache.set(candidateType, isArrayLike);

        return isArrayLike;
    }

    if (candidateType.isIntersection()) {
        const isArrayLike = candidateType.types.some((partType) =>
            evaluateIsArrayLikeType({
                candidateType: partType,
                checker,
                resolutionCache,
                seenTypes,
                unionMatchMode,
            })
        );

        resolutionCache.set(candidateType, isArrayLike);

        return isArrayLike;
    }

    const baseConstraint = getTypeCheckerBaseConstraintType(
        checker,
        candidateType
    );
    if (
        isDefined(baseConstraint) &&
        baseConstraint !== candidateType &&
        evaluateIsArrayLikeType({
            candidateType: baseConstraint,
            checker,
            resolutionCache,
            seenTypes,
            unionMatchMode,
        })
    ) {
        resolutionCache.set(candidateType, true);

        return true;
    }

    const apparentType = getTypeCheckerApparentType(checker, candidateType);
    if (isDefined(apparentType) && apparentType !== candidateType) {
        const isArrayLike = evaluateIsArrayLikeType({
            candidateType: apparentType,
            checker,
            resolutionCache,
            seenTypes,
            unionMatchMode,
        });

        resolutionCache.set(candidateType, isArrayLike);

        return isArrayLike;
    }

    resolutionCache.set(candidateType, false);

    return false;
};

/**
 * Determine whether a TypeScript type resolves to an array-like shape.
 *
 * @param checker - Type checker used to inspect and unwrap candidate types.
 * @param type - Candidate type to evaluate.
 * @param unionMatchMode - Strategy for union members (`"some"` or `"every"`).
 *
 * @returns `true` when the candidate resolves to an array/tuple-like type.
 */
export const isArrayLikeType = (
    checker: Readonly<ts.TypeChecker>,
    type: Readonly<ts.Type>,
    unionMatchMode: UnionArrayLikeMatchMode = "some"
): boolean =>
    evaluateIsArrayLikeType({
        candidateType: type,
        checker,
        resolutionCache: new Map<Readonly<ts.Type>, boolean>(),
        seenTypes: new Set<Readonly<ts.Type>>(),
        unionMatchMode,
    });

const getArrayLikeExpressionPrefilterResult = (
    expression: Readonly<TSESTree.Expression>
): boolean | undefined => {
    if (expression.type === "ArrayExpression") {
        return true;
    }

    if (
        expression.type === "TSAsExpression" ||
        expression.type === "TSNonNullExpression" ||
        expression.type === "TSSatisfiesExpression"
    ) {
        return getArrayLikeExpressionPrefilterResult(expression.expression);
    }

    return undefined;
};

/**
 * Build a safe ESTree expression predicate for array-like type checks.
 *
 * @param options - Type checker and parser-service dependencies.
 *
 * @returns Function that returns `true` when the expression is array-like.
 */
export const createIsArrayLikeExpressionChecker = ({
    checker,
    parserServices,
    telemetryFilePath,
    unionMatchMode = "some",
}: Readonly<ArrayLikeExpressionCheckerOptions>) => {
    const arrayLikeTypeResolutionCache = new Map<Readonly<ts.Type>, boolean>();

    return (expression: Readonly<TSESTree.Expression>): boolean => {
        const prefilterResult =
            getArrayLikeExpressionPrefilterResult(expression);

        recordTypedPathPrefilterEvaluation({
            filePath: telemetryFilePath,
            prefilterHit: isDefined(prefilterResult),
        });

        if (isDefined(prefilterResult)) {
            return prefilterResult;
        }

        const result = safeTypeOperation({
            operation: () => {
                const expressionType = getConstrainedTypeAtLocationWithFallback(
                    checker,
                    expression,
                    parserServices,
                    "array-like-expression-type-resolution-failed"
                );

                if (!isDefined(expressionType)) {
                    return false;
                }

                return evaluateIsArrayLikeType({
                    candidateType: expressionType,
                    checker,
                    resolutionCache: arrayLikeTypeResolutionCache,
                    seenTypes: new Set<Readonly<ts.Type>>(),
                    unionMatchMode,
                });
            },
            reason: "array-like-expression-check-failed",
        });

        if (!result.ok) {
            return false;
        }

        return result.value;
    };
};

/**
 * Check whether a member expression is used as a write target.
 *
 * @param node - Member expression candidate.
 *
 * @returns `true` for assignment LHS, `delete` target, or update operand.
 */
export const isWriteTargetMemberExpression = (
    node: Readonly<TSESTree.MemberExpression>
): boolean => {
    const parentNode = getParentNode(node);

    if (parentNode === undefined) {
        return false;
    }

    if (parentNode.type === "AssignmentExpression") {
        return parentNode.left === node;
    }

    if (parentNode.type === "UnaryExpression") {
        return parentNode.operator === "delete";
    }

    if (parentNode.type === "UpdateExpression") {
        return parentNode.argument === node;
    }

    return false;
};
