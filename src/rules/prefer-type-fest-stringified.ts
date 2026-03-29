/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-stringified`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Detect mapped types equivalent to `Stringified<T>`.
 *
 * @param node - Mapped type node to inspect.
 *
 * @returns `true` when the mapped type has the exact `Stringified<T>`
 *   equivalent shape.
 */
const hasStringifiedMappedTypeShape = (
    node: Readonly<TSESTree.TSMappedType>
): boolean => {
    if (node.readonly !== false && isDefined(node.readonly)) {
        return false;
    }

    if (node.optional !== false && isDefined(node.optional)) {
        return false;
    }

    if (node.nameType !== null) {
        return false;
    }

    if (node.key.type !== "Identifier") {
        return false;
    }

    const { constraint } = node;

    if (constraint?.type !== "TSTypeOperator") {
        return false;
    }

    if (constraint.operator !== "keyof") {
        return false;
    }

    return node.typeAnnotation?.type === "TSStringKeyword";
};

/**
 * ESLint rule definition for `prefer-type-fest-stringified`.
 */
const preferTypeFestStringifiedRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSMappedType(node) {
                    if (!hasStringifiedMappedTypeShape(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferStringified",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Stringified over manual mapped types of the form { [K in keyof T]: string }.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-stringified",
            },
            messages: {
                preferStringified:
                    "Prefer `Stringified<T>` from type-fest over manual mapped types of the form `{ [K in keyof T]: string }`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-stringified",
    });

export default preferTypeFestStringifiedRule;
