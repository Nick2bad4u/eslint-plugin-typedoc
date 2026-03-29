/**
 * @packageDocumentation
 * Type-level contract tests for public plugin exports.
 */
import type {
    TypefestConfigName,
    TypefestPlugin,
    TypefestRuleId,
    TypefestRuleName,
} from "eslint-plugin-typefest";

import { assertType } from "vitest";

const validConfigName = "recommended-type-checked";

assertType<TypefestConfigName>(validConfigName);
// @ts-expect-error Invalid preset key must not satisfy TypefestConfigName.
assertType<TypefestConfigName>("recommendedTypeChecked");

const validRuleId = "typefest/prefer-type-fest-arrayable";

assertType<TypefestRuleId>(validRuleId);
// @ts-expect-error Rule ids must include the `typefest/` namespace prefix.
assertType<TypefestRuleId>("prefer-type-fest-arrayable");

type RuleNameFromRuleId = TypefestRuleId extends `typefest/${infer RuleName}`
    ? RuleName
    : never;

declare const pluginContract: TypefestPlugin;

assertType<TypefestRuleName>(
    "prefer-type-fest-arrayable" satisfies RuleNameFromRuleId
);
assertType(pluginContract.configs.recommended);
assertType(pluginContract.configs.all);
assertType(pluginContract.configs.experimental);
assertType(pluginContract.configs);
assertType(pluginContract.meta.name);
assertType(pluginContract.meta.namespace);
