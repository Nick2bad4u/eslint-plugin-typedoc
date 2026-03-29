import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { describe, expect, it, vi } from "vitest";

import { memoizeExpressionBooleanPredicate } from "../src/_internal/expression-boolean-memoizer";

const createIdentifierExpression = (
    name: string
): Readonly<TSESTree.Expression> =>
    ({
        name,
        type: AST_NODE_TYPES.Identifier,
    }) as unknown as TSESTree.Expression;

describe(memoizeExpressionBooleanPredicate, () => {
    it("memoizes by expression identity and avoids duplicate predicate calls", () => {
        const evaluate = vi.fn(
            (expression: Readonly<TSESTree.Expression>) =>
                expression.type === AST_NODE_TYPES.Identifier &&
                expression.name === "value"
        );

        const memoizedPredicate = memoizeExpressionBooleanPredicate(evaluate);
        const expressionNode = createIdentifierExpression("value");

        expect(memoizedPredicate(expressionNode)).toBeTruthy();
        expect(memoizedPredicate(expressionNode)).toBeTruthy();
        expect(evaluate).toHaveBeenCalledTimes(1);
    });

    it("caches false results and returns them without recomputation", () => {
        const evaluate = vi.fn(() => false);

        const memoizedPredicate = memoizeExpressionBooleanPredicate(evaluate);
        const expressionNode = createIdentifierExpression("other");

        expect(memoizedPredicate(expressionNode)).toBeFalsy();
        expect(memoizedPredicate(expressionNode)).toBeFalsy();
        expect(evaluate).toHaveBeenCalledTimes(1);
    });

    it("keeps separate cache entries for different expression nodes", () => {
        const evaluate = vi.fn(
            (expression: Readonly<TSESTree.Expression>) =>
                expression.type === AST_NODE_TYPES.Identifier &&
                expression.name.length > 3
        );

        const memoizedPredicate = memoizeExpressionBooleanPredicate(evaluate);

        const firstExpression = createIdentifierExpression("longName");
        const secondExpression = createIdentifierExpression("id");

        expect(memoizedPredicate(firstExpression)).toBeTruthy();
        expect(memoizedPredicate(secondExpression)).toBeFalsy();
        expect(evaluate).toHaveBeenCalledTimes(2);
    });
});
