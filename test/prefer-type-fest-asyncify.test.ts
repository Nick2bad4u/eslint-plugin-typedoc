import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-asyncify";
const docsDescription =
    "require TypeFest Asyncify over async function-type wrappers built from Parameters + Promise<Awaited<ReturnType<...>>>.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-asyncify";
const preferAsyncifyMessage =
    "Prefer `Asyncify<Function>` from type-fest over manual async wrappers built from `Parameters<Function>` and `Promise<Awaited<ReturnType<Function>>>`.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferAsyncify: preferAsyncifyMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-asyncify metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { Asyncify } from "type-fest";',
                "",
                "type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =",
                "    (...arguments_: Parameters<Function_>) => Promise<Awaited<ReturnType<Function_>>>;",
                "",
                "type Preferred<Function_ extends (...arguments_: any[]) => any> = Asyncify<Function_>;",
            ].join("\n"),
            errors: [{ messageId: "preferAsyncify" }],
            name: "reports direct async Parameters-based wrappers",
        },
        {
            code: [
                'import type { Asyncify, SetReturnType as ChangeReturnType } from "type-fest";',
                "",
                "type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =",
                "    ChangeReturnType<Function_, Promise<Awaited<ReturnType<Function_>>>>;",
                "",
                "type Preferred<Function_ extends (...arguments_: any[]) => any> = Asyncify<Function_>;",
            ].join("\n"),
            errors: [{ messageId: "preferAsyncify" }],
            name: "reports SetReturnType compositions that are exactly Asyncify",
        },
    ],
    valid: [
        {
            code: [
                'import type { Asyncify } from "type-fest";',
                "",
                "type AsyncVersion<Function_ extends (...arguments_: any[]) => any> = Asyncify<Function_>;",
            ].join("\n"),
            name: "accepts preferred Asyncify usage",
        },
        {
            code: [
                'import type { SetReturnType } from "type-fest";',
                "",
                "type WithResult<Function_ extends (...arguments_: any[]) => any, Result> = SetReturnType<Function_, Result>;",
            ].join("\n"),
            name: "ignores non-async SetReturnType compositions",
        },
    ],
});
