import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-distributed-pick";
const docsDescription =
    "require TypeFest DistributedPick over distributive conditional helpers of the form T extends unknown ? Pick<T, K> : never.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-distributed-pick";
const preferDistributedPickMessage =
    "Prefer `DistributedPick<ObjectType, KeyType>` from type-fest over distributive conditional helpers like `T extends unknown ? Pick<T, K> : never`.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferDistributedPick: preferDistributedPickMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-distributed-pick metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { DistributedPick } from "type-fest";',
                "",
                "type OnlyKeys<Union, Key extends PropertyKey> =",
                "    Union extends unknown ? Pick<Union, Key> : never;",
                "",
                "type Preferred<Union, Key extends PropertyKey> = DistributedPick<Union, Key>;",
            ].join("\n"),
            errors: [{ messageId: "preferDistributedPick" }],
            name: "reports direct distributive Pick helpers",
        },
        {
            code: [
                'import type { DistributedPick } from "type-fest";',
                "",
                "type OnlyKeys<Union, Key extends PropertyKey> =",
                "    Union extends any ? Pick<Union, Extract<Key, keyof Union>> : never;",
                "",
                "type Preferred<Union, Key extends PropertyKey> = DistributedPick<Union, Key>;",
            ].join("\n"),
            errors: [{ messageId: "preferDistributedPick" }],
            name: "reports extract-wrapped distributive Pick helpers",
        },
    ],
    valid: [
        {
            code: [
                'import type { DistributedPick } from "type-fest";',
                "",
                "type OnlyKeys<Union, Key extends PropertyKey> = DistributedPick<Union, Key>;",
            ].join("\n"),
            name: "accepts preferred DistributedPick usage",
        },
        {
            code: [
                "type OnlyKeys<ObjectType, Key extends keyof ObjectType> = Pick<ObjectType, Key>;",
            ].join("\n"),
            name: "ignores non-distributive built-in Pick usage",
        },
        {
            code: [
                "type OnlyKeys<Union, Key extends PropertyKey> =",
                "    Union extends string ? Pick<Union, never> : never;",
            ].join("\n"),
            name: "ignores conditional helpers that are not generic distributive wrappers",
        },
    ],
});
