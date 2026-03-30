/* eslint-disable vitest/no-hooks, vitest/prefer-hooks-in-order, vitest/require-top-level-describe, vitest/valid-describe-callback, vitest/expect-expect, vitest/no-disabled-tests -- RuleTester requires global hook/test adapter wiring outside normal Vitest test structure. */

import type { TSESLint } from "@typescript-eslint/utils";

import tsEslintParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    test,
} from "vitest";

import typedocPlugin from "../../src/plugin.js";

interface RuleTesterHooks {
    afterAll?: (testCase: () => Promise<void> | void) => void;
    afterEach?: (testCase: () => Promise<void> | void) => void;
    beforeAll?: (testCase: () => Promise<void> | void) => void;
    beforeEach?: (testCase: () => Promise<void> | void) => void;
}

const ruleTesterHooks = RuleTester as unknown as RuleTesterHooks;

ruleTesterHooks.afterAll = (testCase) => {
    afterAll(testCase);
};

ruleTesterHooks.afterEach = (testCase) => {
    afterEach(testCase);
};

ruleTesterHooks.beforeAll = (testCase) => {
    beforeAll(testCase);
};

ruleTesterHooks.beforeEach = (testCase) => {
    beforeEach(testCase);
};

RuleTester.describe = ((...args: readonly unknown[]) => {
    const text = args[0] as string;
    const method = args[1] as () => void;

    describe(text, method);
}) as unknown as typeof RuleTester.describe;

RuleTester.it = ((...args: readonly unknown[]) => {
    const text = args[0] as string;
    const method = args[1] as () => Promise<void> | void;

    test(text, method);
}) as unknown as typeof RuleTester.it;

RuleTester.itOnly = ((...args: readonly unknown[]) => {
    const text = args[0] as string;
    const method = args[1] as () => Promise<void> | void;

    test(text, method);
}) as unknown as typeof RuleTester.itOnly;

RuleTester.itSkip = ((...args: readonly unknown[]) => {
    const text = args[0] as string;
    const method = args[1] as () => Promise<void> | void;

    test.skip(text, method);
}) as unknown as typeof RuleTester.itSkip;

/* eslint-enable vitest/no-hooks, vitest/prefer-hooks-in-order, vitest/require-top-level-describe, vitest/valid-describe-callback, vitest/expect-expect, vitest/no-disabled-tests */

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
    ruleName: keyof NonNullable<typeof typedocPlugin.rules>
): TSESLint.RuleModule<string, readonly unknown[]> => {
    const rule = typedocPlugin.rules?.[ruleName];

    if (rule === undefined) {
        throw new TypeError(`Unknown plugin rule: ${ruleName}`);
    }

    return rule as unknown as TSESLint.RuleModule<string, readonly unknown[]>;
};
