import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-pick-index-signature";
const docsDescription =
    "require TypeFest PickIndexSignature over manual mapped types that keep only index signatures.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-pick-index-signature";
const preferPickIndexSignatureMessage =
    "Prefer `PickIndexSignature<ObjectType>` from type-fest over manual mapped types that keep only index signatures.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferPickIndexSignature: preferPickIndexSignatureMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-pick-index-signature metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { PickIndexSignature } from "type-fest";',
                "",
                "type IndexOnly<ObjectType> = {",
                "    [Key in keyof ObjectType as {} extends Record<Key, unknown>",
                "        ? Key",
                "        : never]: ObjectType[Key];",
                "};",
                "",
                "type Preferred<ObjectType> = PickIndexSignature<ObjectType>;",
            ].join("\n"),
            errors: [{ messageId: "preferPickIndexSignature" }],
            name: "reports the canonical mapped-type counterpart to PickIndexSignature",
        },
    ],
    valid: [
        {
            code: [
                'import type { PickIndexSignature } from "type-fest";',
                "",
                "type IndexOnly<ObjectType> = PickIndexSignature<ObjectType>;",
            ].join("\n"),
            name: "accepts preferred PickIndexSignature usage",
        },
        {
            code: [
                "type ExplicitOnly<ObjectType> = {",
                "    [Key in keyof ObjectType as {} extends Record<Key, unknown>",
                "        ? never",
                "        : Key]: ObjectType[Key];",
                "};",
            ].join("\n"),
            name: "ignores the opposite OmitIndexSignature-style mapping",
        },
    ],
});
