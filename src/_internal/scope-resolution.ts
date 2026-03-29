/**
 * @packageDocumentation
 * Context/source-code scope-resolution helpers.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { safeCastTo } from "ts-extras";

type SourceCodeScopeGetter = Readonly<{
    getScope: (node: Readonly<TSESTree.Node>) => TSESLint.Scope.Scope;
}>;

/**
 * Resolve the lexical scope for a node via modern SourceCode APIs.
 *
 * @remarks
 * ESLint v9+ exposes scope lookups via `context.sourceCode.getScope(node)`.
 * This helper intentionally does not use legacy `context.getScope()`.
 *
 * @param context - Active rule context.
 * @param node - Node used as the scope lookup anchor.
 *
 * @returns Scope when available; otherwise `null`.
 */
export const getScopeFromContextSourceCode = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    node: Readonly<TSESTree.Node>
): null | Readonly<TSESLint.Scope.Scope> => {
    const sourceCodeMaybeWithScope = safeCastTo<
        Partial<SourceCodeScopeGetter> | undefined
    >(context.sourceCode);

    if (typeof sourceCodeMaybeWithScope?.getScope !== "function") {
        return null;
    }

    return sourceCodeMaybeWithScope.getScope(node);
};
