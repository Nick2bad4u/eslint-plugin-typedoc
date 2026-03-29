/**
 * @packageDocumentation
 * Runtime/property-test helpers for `prefer-ts-extras-is-present-filter` tests.
 */

import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

import { isSafeGeneratedIdentifier } from "./fast-check";

export type AutoFixableTemplateId =
    | "looseNull"
    | "looseNullReversed"
    | "looseTypeofUndefined"
    | "looseTypeofUndefinedReversed"
    | "looseUndefined"
    | "looseUndefinedReversed"
    | "strictNullAndUndefined"
    | "strictUndefinedAndNull";

export type StrictPredicateTemplateId =
    | "strictNull"
    | "strictNullReversed"
    | "strictUndefined"
    | "strictUndefinedReversed";

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

export const callbackParameterNameArbitrary: fc.Arbitrary<string> = fc
    .string({ maxLength: 9, minLength: 1 })
    .filter((candidate) => isSafeGeneratedIdentifier(candidate));

export const autoFixableTemplateIdArbitrary: fc.Arbitrary<AutoFixableTemplateId> =
    fc.constantFrom<AutoFixableTemplateId>(
        "looseNull",
        "looseNullReversed",
        "looseUndefined",
        "looseUndefinedReversed",
        "looseTypeofUndefined",
        "looseTypeofUndefinedReversed",
        "strictNullAndUndefined",
        "strictUndefinedAndNull"
    );

export const strictPredicateTemplateIdArbitrary: fc.Arbitrary<StrictPredicateTemplateId> =
    fc.constantFrom<StrictPredicateTemplateId>(
        "strictNull",
        "strictNullReversed",
        "strictUndefined",
        "strictUndefinedReversed"
    );

export const formatAutoFixableGuardExpression = (
    templateId: AutoFixableTemplateId,
    parameterName: string
): string => {
    if (templateId === "looseNull") {
        return `${parameterName} != null`;
    }

    if (templateId === "looseNullReversed") {
        return `null != ${parameterName}`;
    }

    if (templateId === "looseUndefined") {
        return `${parameterName} != undefined`;
    }

    if (templateId === "looseUndefinedReversed") {
        return `undefined != ${parameterName}`;
    }

    if (templateId === "looseTypeofUndefined") {
        return `typeof ${parameterName} != "undefined"`;
    }

    if (templateId === "looseTypeofUndefinedReversed") {
        return `"undefined" != typeof ${parameterName}`;
    }

    if (templateId === "strictNullAndUndefined") {
        return `${parameterName} !== null && ${parameterName} !== undefined`;
    }

    return `${parameterName} !== undefined && ${parameterName} !== null`;
};

export const formatStrictPredicateExpression = (
    templateId: StrictPredicateTemplateId,
    parameterName: string
): string => {
    if (templateId === "strictNull") {
        return `${parameterName} !== null`;
    }

    if (templateId === "strictNullReversed") {
        return `null !== ${parameterName}`;
    }

    if (templateId === "strictUndefined") {
        return `${parameterName} !== undefined`;
    }

    return `undefined !== ${parameterName}`;
};

export const parseFilterCallFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callbackRange: readonly [number, number];
    callExpression: TSESTree.CallExpression;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);
    let callExpression: null | TSESTree.CallExpression = null;

    for (const statement of parsed.ast.body) {
        if (statement.type === AST_NODE_TYPES.VariableDeclaration) {
            for (const declaration of statement.declarations) {
                if (declaration.init?.type === AST_NODE_TYPES.CallExpression) {
                    callExpression = declaration.init;
                    break;
                }
            }
        }

        if (callExpression) {
            break;
        }
    }

    if (!callExpression) {
        throw new Error(
            "Expected generated declaration to initialize from filter call"
        );
    }

    const callback = callExpression.arguments[0];

    if (callback?.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
        throw new Error(
            "Expected generated filter call to include an arrow-function callback"
        );
    }

    const callbackRange = callback.range;

    return {
        ast: parsed.ast,
        callbackRange,
        callExpression,
    };
};
