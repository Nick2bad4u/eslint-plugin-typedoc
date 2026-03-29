import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-stringified` behavior.
 */
const ruleId = "prefer-type-fest-stringified";
const docsDescription =
    "require TypeFest Stringified over manual mapped types of the form { [K in keyof T]: string }.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-stringified";
const preferStringifiedMessage =
    "Prefer `Stringified<T>` from type-fest over manual mapped types of the form `{ [K in keyof T]: string }`.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferStringified: preferStringifiedMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-stringified metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { Stringified } from "type-fest";',
                "",
                "type Car = {",
                "    model: string;",
                "    speed: number;",
                "};",
                "",
                "type CarForm = { [Key in keyof Car]: string };",
                "type Preferred = Stringified<Car>;",
            ].join("\n"),
            errors: [{ messageId: "preferStringified" }],
            name: "reports canonical stringified mapped types",
        },
    ],
    valid: [
        {
            code: [
                'import type { Stringified } from "type-fest";',
                "",
                "type Car = {",
                "    model: string;",
                "    speed: number;",
                "};",
                "",
                "type CarForm = Stringified<Car>;",
            ].join("\n"),
            name: "accepts preferred Stringified usage",
        },
        {
            code: [
                "type Car = {",
                "    model: string;",
                "    speed: number;",
                "};",
                "",
                "type CarForm = { readonly [Key in keyof Car]: string };",
            ].join("\n"),
            name: "ignores readonly mapped types",
        },
        {
            code: [
                "type Car = {",
                "    model: string;",
                "    speed: number;",
                "};",
                "",
                "type CarForm = { [Key in keyof Car as `car-" +
                    "${" +
                    "Key & string}`]: string };",
            ].join("\n"),
            name: "ignores mapped types with key remapping",
        },
        {
            code: [
                "type Car = {",
                "    model: string;",
                "    speed: number;",
                "};",
                "",
                "type CarForm = { [Key in keyof Car]: number };",
            ].join("\n"),
            name: "ignores mapped types whose value is not string",
        },
    ],
});
