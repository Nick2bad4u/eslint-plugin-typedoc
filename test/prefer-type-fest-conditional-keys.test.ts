import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-conditional-keys";
const docsDescription =
    "require TypeFest ConditionalKeys over keyof-remapped mapped types that filter keys by value condition.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-keys";
const preferConditionalKeysMessage =
    "Prefer `ConditionalKeys<Base, Condition>` from type-fest over manual `keyof { [K in keyof Base as Base[K] extends Condition ? K : never]: ... }` key filters.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferConditionalKeys: preferConditionalKeysMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-conditional-keys metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { ConditionalKeys } from "type-fest";',
                "",
                "type KeysMatching<Base, Condition> = keyof {",
                "    [Key in keyof Base as Base[Key] extends Condition",
                "        ? Key",
                "        : never]: never;",
                "};",
                "",
                "type Preferred<Base, Condition> = ConditionalKeys<Base, Condition>;",
            ].join("\n"),
            errors: [{ messageId: "preferConditionalKeys" }],
            name: "reports canonical keyof-remapped conditional key filters",
        },
        {
            code: [
                'import type { ConditionalKeys } from "type-fest";',
                "",
                "type KeysMatching<Base, Condition> = keyof {",
                "    [Key in keyof Base as Base[Key] extends Condition",
                "        ? Key",
                "        : never]: Base[Key];",
                "};",
                "",
                "type Preferred<Base, Condition> = ConditionalKeys<Base, Condition>;",
            ].join("\n"),
            errors: [{ messageId: "preferConditionalKeys" }],
            name: "reports equivalent key filters even when the mapped value is preserved",
        },
    ],
    valid: [
        {
            code: [
                'import type { ConditionalKeys } from "type-fest";',
                "",
                "type KeysMatching<Base, Condition> = ConditionalKeys<Base, Condition>;",
            ].join("\n"),
            name: "accepts preferred ConditionalKeys usage",
        },
        {
            code: [
                "type KeepShape<Base> = keyof {",
                "    [Key in keyof Base]: Base[Key];",
                "};",
            ].join("\n"),
            name: "ignores plain keyof mapped types without conditional remapping",
        },
    ],
});
