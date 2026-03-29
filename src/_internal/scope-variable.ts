/**
 * @packageDocumentation
 * Scope-chain helpers for reliable variable-resolution checks.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { resolveFirstValueInLinkedStructure } from "./cycle-safe-linked-search.js";

/**
 * Resolve a variable binding by walking the current scope and all parent
 * scopes.
 *
 * @param scope - Initial scope to inspect.
 * @param variableName - Identifier name to resolve.
 *
 * @returns Matched variable binding from the nearest scope chain; otherwise
 *   `null`.
 */
export const getVariableInScopeChain = (
    scope: Readonly<null | Readonly<TSESLint.Scope.Scope>>,
    variableName: string
): null | TSESLint.Scope.Variable => {
    const lookupResult = resolveFirstValueInLinkedStructure<
        Readonly<TSESLint.Scope.Scope>,
        TSESLint.Scope.Variable
    >({
        getNextNode: (
            currentScope: Readonly<TSESLint.Scope.Scope>
        ): null | Readonly<TSESLint.Scope.Scope> => currentScope.upper,
        resolveValue: (currentScope: Readonly<TSESLint.Scope.Scope>) => {
            const variable = currentScope.set.get(variableName);

            return variable === undefined
                ? {
                      found: false,
                  }
                : {
                      found: true,
                      value: variable,
                  };
        },
        startNode: scope,
    });

    return lookupResult.found ? lookupResult.value : null;
};
