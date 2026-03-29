/**
 * @packageDocumentation
 * Unit tests for member-call matching helpers.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it } from "vitest";

import {
    getIdentifierMemberCall,
    getIdentifierPropertyMemberCall,
} from "../../src/_internal/member-call";

describe(getIdentifierMemberCall, () => {
    it("matches direct identifier receiver/member calls", () => {
        const node = {
            callee: {
                computed: false,
                object: {
                    name: "Object",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "keys",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            getIdentifierMemberCall({
                memberName: "keys",
                node,
                objectName: "Object",
            })
        ).toBe(node);
    });

    it("returns null when receiver object name does not match", () => {
        const node = {
            callee: {
                computed: false,
                object: {
                    name: "Reflect",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "keys",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            getIdentifierMemberCall({
                memberName: "keys",
                node,
                objectName: "Object",
            })
        ).toBeNull();
    });
});

describe(getIdentifierPropertyMemberCall, () => {
    it("matches identifier-property member calls", () => {
        const node = {
            callee: {
                computed: false,
                object: {
                    name: "values",
                    type: "Identifier",
                },
                optional: false,
                property: {
                    name: "includes",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            getIdentifierPropertyMemberCall({
                memberName: "includes",
                node,
            })
        ).toBe(node);
    });

    it("returns null when member-call receiver is super", () => {
        const node = {
            callee: {
                computed: false,
                object: {
                    type: "Super",
                },
                optional: false,
                property: {
                    name: "includes",
                    type: "Identifier",
                },
                type: "MemberExpression",
            },
            optional: false,
            type: "CallExpression",
        } as unknown as TSESTree.CallExpression;

        expect(
            getIdentifierPropertyMemberCall({
                memberName: "includes",
                node,
            })
        ).toBeNull();
    });
});
