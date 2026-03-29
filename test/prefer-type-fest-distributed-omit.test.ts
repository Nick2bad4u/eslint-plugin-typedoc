import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-distributed-omit";
const docsDescription =
    "require TypeFest DistributedOmit over distributive conditional helpers of the form T extends unknown ? Omit<T, K> : never.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-distributed-omit";
const preferDistributedOmitMessage =
    "Prefer `DistributedOmit<ObjectType, KeyType>` from type-fest over distributive conditional helpers like `T extends unknown ? Omit<T, K> : never`.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferDistributedOmit: preferDistributedOmitMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-distributed-omit metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { DistributedOmit, KeysOfUnion } from "type-fest";',
                "",
                "type WithoutKeys<Union, Key extends KeysOfUnion<Union>> =",
                "    Union extends unknown ? Omit<Union, Key> : never;",
                "",
                "type Preferred<Union, Key extends KeysOfUnion<Union>> = DistributedOmit<Union, Key>;",
            ].join("\n"),
            errors: [{ messageId: "preferDistributedOmit" }],
            name: "reports canonical distributive Omit helpers",
        },
        {
            code: [
                'import type { DistributedOmit, KeysOfUnion } from "type-fest";',
                "",
                "type WithoutKeys<Union, Key extends KeysOfUnion<Union>> =",
                "    Union extends any ? Omit<Union, Key> : never;",
                "",
                "type Preferred<Union, Key extends KeysOfUnion<Union>> = DistributedOmit<Union, Key>;",
            ].join("\n"),
            errors: [{ messageId: "preferDistributedOmit" }],
            name: "reports any-based distributive wrappers too",
        },
    ],
    valid: [
        {
            code: [
                'import type { DistributedOmit, KeysOfUnion } from "type-fest";',
                "",
                "type WithoutKeys<Union, Key extends KeysOfUnion<Union>> = DistributedOmit<Union, Key>;",
            ].join("\n"),
            name: "accepts preferred DistributedOmit usage",
        },
        {
            code: [
                "type WithoutKeys<Union, Key extends keyof Union> = Omit<Union, Key>;",
            ].join("\n"),
            name: "ignores non-distributive built-in Omit usage",
        },
        {
            code: [
                "type WithoutKeys<Union, Key extends PropertyKey> =",
                "    Union extends string ? Omit<Union, Key> : never;",
            ].join("\n"),
            name: "ignores conditional helpers that are not simple distributive wrappers",
        },
    ],
});
