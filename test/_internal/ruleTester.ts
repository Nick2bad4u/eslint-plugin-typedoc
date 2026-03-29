import { RuleTester } from "@typescript-eslint/rule-tester";
import type { TSESLint } from "@typescript-eslint/utils";
import tsEslintParser from "@typescript-eslint/parser";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    it,
} from "vitest";

import plugin from "../../src/plugin.js";

RuleTester.afterAll = afterAll;
RuleTester.afterEach = afterEach;
RuleTester.beforeAll = beforeAll;
RuleTester.beforeEach = beforeEach;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;

/**
 * Create a default RuleTester instance for plugin rule tests.
 */
export const createRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            ecmaVersion: "latest",
            parser: tsEslintParser,
            parserOptions: {
                sourceType: "module",
            },
        },
    });

/**
 * Resolve a rule module through the public plugin entrypoint.
 */
export const getPluginRule = (
    ruleName: keyof NonNullable<typeof plugin.rules>
): TSESLint.RuleModule<string, readonly unknown[]> => {
    const rule = plugin.rules?.[ruleName];

    if (rule === undefined) {
        throw new TypeError(`Unknown plugin rule: ${String(ruleName)}`);
    }

    return rule;
};
