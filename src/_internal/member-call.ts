/**
 * @packageDocumentation
 * Shared call-expression helpers for matching method calls safely.
 */
import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Strongly-typed shape for non-computed member calls with identifier receiver
 * and property (e.g. `Object.keys`).
 */
export type IdentifierMemberCallExpression = TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        object: TSESTree.Identifier;
        property: TSESTree.Identifier;
    };
};

/**
 * Strongly-typed shape for non-computed member calls with identifier property
 * (e.g. `value.includes`).
 */
export type IdentifierPropertyMemberCallExpression = TSESTree.CallExpression & {
    callee: TSESTree.MemberExpression & {
        computed: false;
        object: Exclude<TSESTree.MemberExpression["object"], TSESTree.Super>;
        property: TSESTree.Identifier;
    };
};

/**
 * Match `ObjectName.methodName(...)` style calls.
 *
 * @param options - Candidate call expression and expected receiver/member
 *   names.
 *
 * @returns Narrowed call expression when the shape matches; otherwise `null`.
 */
export const getIdentifierMemberCall = ({
    memberName,
    node,
    objectName,
}: Readonly<{
    memberName: string;
    node: Readonly<TSESTree.CallExpression>;
    objectName: string;
}>): IdentifierMemberCallExpression | null => {
    if (node.optional) {
        return null;
    }

    const { callee } = node;

    if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.optional ||
        callee.object.type !== "Identifier" ||
        callee.object.name !== objectName ||
        callee.property.type !== "Identifier" ||
        callee.property.name !== memberName
    ) {
        return null;
    }

    return node as IdentifierMemberCallExpression;
};

/**
 * Match `<expression>.memberName(...)` style calls where the property is a
 * non-computed identifier.
 *
 * @param options - Candidate call expression and expected member name.
 *
 * @returns Narrowed call expression when matched; otherwise `null`.
 */
export const getIdentifierPropertyMemberCall = ({
    memberName,
    node,
}: Readonly<{
    memberName: string;
    node: Readonly<TSESTree.CallExpression>;
}>): IdentifierPropertyMemberCallExpression | null => {
    if (node.optional) {
        return null;
    }

    const { callee } = node;

    if (
        callee.type !== "MemberExpression" ||
        callee.computed ||
        callee.optional ||
        callee.object.type === "Super" ||
        callee.property.type !== "Identifier" ||
        callee.property.name !== memberName
    ) {
        return null;
    }

    return node as IdentifierPropertyMemberCallExpression;
};
