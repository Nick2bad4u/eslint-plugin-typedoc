import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-merge` behavior.
 */
const ruleId = "prefer-type-fest-merge";
const docsDescription =
    "require TypeFest Merge over Except<Destination, keyof Source> & Source intersections.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge";
const preferMergeMessage =
    "Prefer `Merge<Destination, Source>` from type-fest over `Except<Destination, keyof Source> & Source` when the second object cleanly overrides the first.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferMerge: preferMergeMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-merge metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { Except, Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> & Overrides;",
                "type Preferred = Merge<Base, Overrides>;",
            ].join("\n"),
            errors: [{ messageId: "preferMerge" }],
            name: "reports canonical merge-style intersections",
        },
        {
            code: [
                'import type { Except as StrictExcept, Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Overrides & StrictExcept<Base, keyof Overrides>;",
                "type Preferred = Merge<Base, Overrides>;",
            ].join("\n"),
            errors: [{ messageId: "preferMerge" }],
            name: "reports reverse-order intersections that still encode merge semantics",
        },
    ],
    valid: [
        {
            code: [
                'import type { Merge } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Merge<Base, Overrides>;",
            ].join("\n"),
            name: "accepts preferred Merge usage",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> | Overrides;",
            ].join("\n"),
            name: "ignores non-intersection compositions",
        },
        {
            code: [
                'import type { Except } from "type-fest";',
                "",
                "type Base = {",
                "    id: string;",
                "    name: string;",
                "};",
                "type Overrides = {",
                "    name: number;",
                "    readonly ok: true;",
                "};",
                "",
                "type Combined = Except<Base, keyof Overrides> & Readonly<Overrides>;",
            ].join("\n"),
            name: "ignores intersections whose sibling does not match the keyof operand exactly",
        },
    ],
});
