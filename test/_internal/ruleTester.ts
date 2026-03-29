import typeScriptParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";

import typedocPlugin from "../../src/plugin.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

export const createTypeScriptRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            parser: typeScriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    });

export const getTypedocRule = (
    ruleName: keyof NonNullable<typeof typedocPlugin.rules>
): Parameters<RuleTester["run"]>[1] => {
    const rule = typedocPlugin.rules?.[ruleName as string];

    if (rule === undefined) {
        throw new TypeError(
            `Expected rule '${String(ruleName)}' to be registered.`
        );
    }

    return rule as unknown as Parameters<RuleTester["run"]>[1];
};
