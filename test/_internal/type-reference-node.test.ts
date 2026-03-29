import type { TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import { isIdentifierTypeReference } from "../../src/_internal/type-reference-node";

/** Contract tests for identifier-only `TSTypeReference` detection. */
describe(isIdentifierTypeReference, () => {
    it("returns true for matching identifier type references", () => {
        const node = {
            type: "TSTypeReference",
            typeName: {
                name: "Arrayable",
                type: "Identifier",
            },
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBeTruthy();
    });

    it("returns false for non-matching identifier names", () => {
        const node = {
            type: "TSTypeReference",
            typeName: {
                name: "Writable",
                type: "Identifier",
            },
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBeFalsy();
    });

    it("returns false for non-type-reference nodes", () => {
        const node = {
            type: "TSStringKeyword",
        } as unknown as TSESTree.TypeNode;

        expect(isIdentifierTypeReference(node, "Arrayable")).toBeFalsy();
    });
});
