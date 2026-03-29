/**
 * @packageDocumentation
 * Helpers for matching static member calls that resolve to global bindings.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    getIdentifierMemberCall,
    type IdentifierMemberCallExpression,
} from "./member-call.js";
import { isGlobalIdentifierNamed } from "./typed-rule.js";

/**
 * Match `GlobalName.memberName(...)` calls where `GlobalName` resolves to the
 * unshadowed global binding.
 *
 * @param options - Rule context and candidate call details.
 *
 * @returns Narrowed call expression when matched against the global binding;
 *   otherwise `null`.
 */
export const getGlobalIdentifierMemberCall = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    memberName,
    node,
    objectName,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    memberName: string;
    node: Readonly<TSESTree.CallExpression>;
    objectName: string;
}>): IdentifierMemberCallExpression | null => {
    const memberCall = getIdentifierMemberCall({
        memberName,
        node,
        objectName,
    });

    if (memberCall === null) {
        return null;
    }

    return isGlobalIdentifierNamed(
        context,
        memberCall.callee.object,
        objectName
    )
        ? memberCall
        : null;
};
