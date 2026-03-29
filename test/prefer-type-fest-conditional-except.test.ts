import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-conditional-except` behavior.
 */
const ruleId = "prefer-type-fest-conditional-except";
const docsDescription =
    "require TypeFest ConditionalExcept over Except<T, ConditionalKeys<T, Condition>> compositions.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-except";
const preferConditionalExceptMessage =
    "Prefer `ConditionalExcept<Base, Condition>` from type-fest over `Except<Base, ConditionalKeys<Base, Condition>>` when excluding keys by value condition.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferConditionalExcept: preferConditionalExceptMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-conditional-except metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { ConditionalExcept, ConditionalKeys, Except } from "type-fest";',
                "",
                "type Example = {",
                "    count: number;",
                "    enabled: boolean;",
                "    name: string;",
                "};",
                "",
                "type NonStrings = Except<Example, ConditionalKeys<Example, string>>;",
                "type Preferred = ConditionalExcept<Example, string>;",
            ].join("\n"),
            errors: [{ messageId: "preferConditionalExcept" }],
            name: "reports canonical Except + ConditionalKeys composition",
        },
        {
            code: [
                'import type { ConditionalExcept, ConditionalKeys as MatchingKeys, Except as StrictExcept } from "type-fest";',
                "",
                "type Example = {",
                "    count: number;",
                "    enabled: boolean;",
                "    name: string;",
                "};",
                "",
                "type NonStrings = StrictExcept<Example, MatchingKeys<Example, string>>;",
                "type Preferred = ConditionalExcept<Example, string>;",
            ].join("\n"),
            errors: [{ messageId: "preferConditionalExcept" }],
            name: "reports aliased type-fest helper compositions",
        },
    ],
    valid: [
        {
            code: [
                'import type { ConditionalExcept } from "type-fest";',
                "",
                "type Example = {",
                "    count: number;",
                "    enabled: boolean;",
                "    name: string;",
                "};",
                "",
                "type NonStrings = ConditionalExcept<Example, string>;",
            ].join("\n"),
            name: "accepts preferred ConditionalExcept usage",
        },
        {
            code: [
                'import type { ConditionalKeys, Omit } from "type-fest";',
                "",
                "type Example = {",
                "    count: number;",
                "    enabled: boolean;",
                "    name: string;",
                "};",
                "",
                "type NonStrings = Omit<Example, ConditionalKeys<Example, string>>;",
            ].join("\n"),
            name: "ignores builtin Omit compositions to avoid overlap with prefer-type-fest-except",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Example = {",
                "    count: number;",
                "    enabled: boolean;",
                "    name: string;",
                "};",
                "type KeysToRemove = keyof Example;",
                "",
                "type NonStrings = Except<Example, KeysToRemove>;",
            ].join("\n"),
            name: "ignores Except usages that do not derive excluded keys from ConditionalKeys",
        },
    ],
});
