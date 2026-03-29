import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-set-return-type";
const docsDescription =
    "require TypeFest SetReturnType over direct function-type wrappers of the form (...args: Parameters<F>) => R.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-return-type";
const preferSetReturnTypeMessage =
    "Prefer `SetReturnType<Function, TypeToReturn>` from type-fest over direct function-type wrappers like `(...args: Parameters<Function>) => TypeToReturn`.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferSetReturnType: preferSetReturnTypeMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-set-return-type metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { SetReturnType } from "type-fest";',
                "",
                "type WithResult<Function_ extends (...arguments_: any[]) => any, Result> =",
                "    (...arguments_: Parameters<Function_>) => Result;",
                "",
                "type Preferred<Function_ extends (...arguments_: any[]) => any, Result> = SetReturnType<Function_, Result>;",
            ].join("\n"),
            errors: [{ messageId: "preferSetReturnType" }],
            name: "reports direct Parameters-based function wrappers",
        },
    ],
    valid: [
        {
            code: [
                'import type { SetReturnType } from "type-fest";',
                "",
                "type WithResult<Function_ extends (...arguments_: any[]) => any, Result> = SetReturnType<Function_, Result>;",
            ].join("\n"),
            name: "accepts preferred SetReturnType usage",
        },
        {
            code: [
                'import type { Asyncify } from "type-fest";',
                "",
                "type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =",
                "    (...arguments_: Parameters<Function_>) => Promise<Awaited<ReturnType<Function_>>>;",
                "",
                "type Preferred<Function_ extends (...arguments_: any[]) => any> = Asyncify<Function_>;",
            ].join("\n"),
            name: "ignores Asyncify-shaped wrappers so the more specific async rule can handle them",
        },
        {
            code: [
                "type Explicit = (value: string, count: number) => boolean;",
            ].join("\n"),
            name: "ignores ordinary function types without Parameters wrappers",
        },
    ],
});
