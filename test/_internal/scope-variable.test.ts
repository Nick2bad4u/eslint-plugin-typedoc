/**
 * @packageDocumentation
 * Unit tests for shared scope-chain variable lookup utilities.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import { getVariableInScopeChain } from "../../src/_internal/scope-variable";

/**
 * Build a minimal Scope fixture with optional parent scope.
 */
const createScope = (
    variablesByName: Readonly<ReadonlyMap<string, TSESLint.Scope.Variable>>,
    upper: null | Readonly<TSESLint.Scope.Scope> = null
): Readonly<TSESLint.Scope.Scope> =>
    ({
        set: new Map(variablesByName),
        upper,
    }) as unknown as Readonly<TSESLint.Scope.Scope>;

const createVariable = (name: string): TSESLint.Scope.Variable =>
    ({
        name,
    }) as unknown as TSESLint.Scope.Variable;

describe(getVariableInScopeChain, () => {
    it("returns null when scope is null", () => {
        expect(getVariableInScopeChain(null, "value")).toBeNull();
    });

    it("returns variable from current scope", () => {
        const localVariable = createVariable("value");
        const scope = createScope(new Map([["value", localVariable]]));

        expect(getVariableInScopeChain(scope, "value")).toBe(localVariable);
    });

    it("walks parent scopes when missing in current scope", () => {
        const parentVariable = createVariable("value");
        const parentScope = createScope(new Map([["value", parentVariable]]));
        const childScope = createScope(new Map(), parentScope);

        expect(getVariableInScopeChain(childScope, "value")).toBe(
            parentVariable
        );
    });

    it("returns nearest shadowed variable in nested scopes", () => {
        const outerVariable = createVariable("value");
        const innerVariable = createVariable("value");

        const outerScope = createScope(new Map([["value", outerVariable]]));
        const innerScope = createScope(
            new Map([["value", innerVariable]]),
            outerScope
        );

        expect(getVariableInScopeChain(innerScope, "value")).toBe(
            innerVariable
        );
    });

    it("returns null when variable is missing from entire scope chain", () => {
        const scope = createScope(new Map());

        expect(getVariableInScopeChain(scope, "missing")).toBeNull();
    });

    it("returns null when the scope chain contains a cycle", () => {
        const firstScope = createScope(new Map());
        const secondScope = createScope(new Map(), firstScope);

        (
            firstScope as {
                upper: null | Readonly<TSESLint.Scope.Scope>;
            }
        ).upper = secondScope;

        expect(getVariableInScopeChain(firstScope, "missing")).toBeNull();
    });

    it("returns a variable in a cyclic chain when encountered before cycle detection", () => {
        const targetVariable = createVariable("value");
        const firstScope = createScope(new Map());
        const secondScope = createScope(
            new Map([["value", targetVariable]]),
            firstScope
        );

        (
            firstScope as {
                upper: null | Readonly<TSESLint.Scope.Scope>;
            }
        ).upper = secondScope;

        expect(getVariableInScopeChain(firstScope, "value")).toBe(
            targetVariable
        );
    });
});
