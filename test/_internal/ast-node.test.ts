import type { TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import { getParentNode, getProgramNode } from "../../src/_internal/ast-node";

/** Create a minimal Program node used as the root parent in traversal tests. */
const createProgramNode = (): TSESTree.Program =>
    ({
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

describe(getParentNode, () => {
    it("returns parent when node has one", () => {
        const parentNode = createProgramNode();
        const childNode = {
            parent: parentNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(getParentNode(childNode)).toBe(parentNode);
    });

    it("returns undefined when node has no parent", () => {
        const nodeWithoutParent = {
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(getParentNode(nodeWithoutParent)).toBeUndefined();
    });
});

describe(getProgramNode, () => {
    it("finds program node through parent chain", () => {
        const programNode = createProgramNode();
        const nestedNode = {
            parent: {
                parent: programNode,
                type: "ExpressionStatement",
            },
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(getProgramNode(nestedNode)).toBe(programNode);
    });

    it("returns null when program ancestor does not exist", () => {
        const orphanNode = {
            parent: {
                type: "ExpressionStatement",
            },
            type: "Identifier",
        } as unknown as TSESTree.Node;

        expect(getProgramNode(orphanNode)).toBeNull();
    });

    it("returns null for cyclic parent chains", () => {
        const cyclicNode = {
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const parentNode = {
            parent: cyclicNode,
            type: "ExpressionStatement",
        } as unknown as TSESTree.Node;

        const nodeWithCycle = {
            parent: parentNode,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        (cyclicNode as unknown as { parent?: TSESTree.Node }).parent =
            nodeWithCycle;

        expect(getProgramNode(nodeWithCycle)).toBeNull();
    });
});
