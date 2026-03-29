import type { TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import {
    getSingleParameterExpressionArrowFilterCallback,
    isFilterCallExpression,
    isWithinFilterCallback,
} from "../../src/_internal/filter-callback";

/** Create a minimal Program ancestor used when synthesizing callback chains. */
const createProgramNode = (): TSESTree.Program =>
    ({
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

describe(isWithinFilterCallback, () => {
    it("returns true for nodes inside .filter callback", () => {
        const program = createProgramNode();

        const callbackNode = {
            parent: undefined,
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const filterCallNode = {
            arguments: [callbackNode],
            callee: {
                computed: false,
                object: {
                    type: "Identifier",
                },
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            parent: program,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        (callbackNode as unknown as { parent?: TSESTree.Node }).parent =
            filterCallNode;

        const nestedNode = {
            parent: callbackNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeTruthy();
    });

    it("returns false for nodes outside .filter callback", () => {
        const program = createProgramNode();

        const callbackNode = {
            parent: undefined,
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const mapCallNode = {
            arguments: [callbackNode],
            callee: {
                computed: false,
                object: {
                    type: "Identifier",
                },
                property: {
                    name: "map",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            parent: program,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        (callbackNode as unknown as { parent?: TSESTree.Node }).parent =
            mapCallNode;

        const nestedNode = {
            parent: callbackNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeFalsy();
    });

    it("returns false for function passed as second .filter argument", () => {
        const program = createProgramNode();

        const actualCallbackNode = {
            parent: undefined,
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const secondArgumentFunctionNode = {
            parent: undefined,
            type: "FunctionExpression",
        } as unknown as TSESTree.FunctionExpression;

        const filterCallNode = {
            arguments: [actualCallbackNode, secondArgumentFunctionNode],
            callee: {
                computed: false,
                object: {
                    type: "Identifier",
                },
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            parent: program,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        (actualCallbackNode as unknown as { parent?: TSESTree.Node }).parent =
            filterCallNode;
        (
            secondArgumentFunctionNode as unknown as { parent?: TSESTree.Node }
        ).parent = filterCallNode;

        const nestedNode = {
            parent: secondArgumentFunctionNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeFalsy();
    });

    it("returns false for computed member access filter calls", () => {
        const program = createProgramNode();

        const callbackNode = {
            parent: undefined,
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const computedFilterCallNode = {
            arguments: [callbackNode],
            callee: {
                computed: true,
                object: {
                    type: "Identifier",
                },
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            parent: program,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        (callbackNode as unknown as { parent?: TSESTree.Node }).parent =
            computedFilterCallNode;

        const nestedNode = {
            parent: callbackNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeFalsy();
    });

    it("returns false for non-member filter calls", () => {
        const program = createProgramNode();

        const callbackNode = {
            parent: undefined,
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const filterIdentifierCallNode = {
            arguments: [callbackNode],
            callee: {
                name: "filter",
                type: "Identifier",
            },
            parent: program,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        (callbackNode as unknown as { parent?: TSESTree.Node }).parent =
            filterIdentifierCallNode;

        const nestedNode = {
            parent: callbackNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeFalsy();
    });

    it("returns false for cyclic parent chains", () => {
        const cycleA = {
            type: "Identifier",
        } as unknown as TSESTree.Node;
        const cycleB = {
            parent: cycleA,
            type: "ExpressionStatement",
        } as unknown as TSESTree.Node;

        (cycleA as unknown as { parent?: TSESTree.Node }).parent = cycleB;

        expect(isWithinFilterCallback(cycleA)).toBeFalsy();
    });

    it("returns false when callback-like node is not parented by a call expression", () => {
        const program = createProgramNode();

        const detachedFunctionNode = {
            parent: program,
            type: "FunctionExpression",
        } as unknown as TSESTree.FunctionExpression;

        const nestedNode = {
            parent: detachedFunctionNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(isWithinFilterCallback(nestedNode)).toBeFalsy();
    });

    it("returns false for optional-chain filter calls", () => {
        const optionalFilterCallNode = {
            arguments: [],
            callee: {
                computed: false,
                object: {
                    name: "values",
                    type: "Identifier",
                },
                optional: true,
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: true,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(isFilterCallExpression(optionalFilterCallNode)).toBeFalsy();
    });

    it("returns false for optional member invocation filter calls", () => {
        const optionalMemberFilterCallNode = {
            arguments: [],
            callee: {
                computed: false,
                object: {
                    name: "values",
                    type: "Identifier",
                },
                optional: true,
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            isFilterCallExpression(optionalMemberFilterCallNode)
        ).toBeFalsy();
    });

    it("extracts single-parameter expression arrow callbacks", () => {
        const callback = {
            body: {
                left: {
                    name: "value",
                    type: "Identifier",
                },
                operator: "!=",
                right: {
                    name: "undefined",
                    type: "Identifier",
                },
                type: "BinaryExpression",
            },
            params: [
                {
                    name: "value",
                    type: "Identifier",
                },
            ],
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const filterCallNode = {
            arguments: [callback],
            callee: {
                computed: false,
                object: {
                    name: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        const callbackMatch =
            getSingleParameterExpressionArrowFilterCallback(filterCallNode);

        expect(callbackMatch).not.toBeNull();
        expect(callbackMatch?.parameter.name).toBe("value");
        expect(callbackMatch?.callback.body.type).toBe("BinaryExpression");
    });

    it("returns null for block-bodied filter arrow callbacks", () => {
        const callback = {
            body: {
                body: [],
                type: "BlockStatement",
            },
            params: [
                {
                    name: "value",
                    type: "Identifier",
                },
            ],
            type: "ArrowFunctionExpression",
        } as unknown as TSESTree.ArrowFunctionExpression;

        const filterCallNode = {
            arguments: [callback],
            callee: {
                computed: false,
                object: {
                    name: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "filter",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            getSingleParameterExpressionArrowFilterCallback(filterCallNode)
        ).toBeNull();
    });
});
