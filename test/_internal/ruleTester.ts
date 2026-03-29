/**
 * @packageDocumentation
 * Shared testing utilities for eslint-plugin-typefest RuleTester and Vitest suites.
 */
import type { UnknownArray, UnknownRecord } from "type-fest";

import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "node:path";
import pc from "picocolors";
import { afterAll, describe, it } from "vitest";

import typefestPlugin from "../../src/plugin";

/**
 * Assert that a dynamic runtime value is callable for RuleTester hook wiring.
 *
 * @param candidate - Dynamic value under validation.
 * @param hookName - Human-readable hook label for diagnostics.
 */
const assertRuleTesterHook: (
    candidate: unknown,
    hookName: string
) => asserts candidate is (...arguments_: UnknownArray) => unknown = (
    candidate,
    hookName
) => {
    if (typeof candidate !== "function") {
        throw new TypeError(
            `Expected Vitest hook '${hookName}' to be a function for RuleTester wiring.`
        );
    }
};

assertRuleTesterHook(afterAll, "afterAll");
RuleTester.afterAll = afterAll as unknown as typeof RuleTester.afterAll;
assertRuleTesterHook(describe, "describe");
RuleTester.describe = describe as unknown as typeof RuleTester.describe;
assertRuleTesterHook(it, "it");
RuleTester.it = it;
const vitestItOnly: unknown = Reflect.get(it, "only");
assertRuleTesterHook(vitestItOnly, "it.only");
RuleTester.itOnly = (
    ...arguments_: readonly [...Parameters<typeof RuleTester.itOnly>]
) => {
    Reflect.apply(vitestItOnly, undefined, arguments_);
};

/** Rule module parameter type accepted by `RuleTester#run`. */
type PluginRuleModule = Parameters<RuleTester["run"]>[1];
/** Full argument tuple for `RuleTester#run`. */
type RuleRunArguments = Parameters<RuleTester["run"]>;
/** Combined valid/invalid case payload accepted by `RuleTester#run`. */
type RuleRunCases = RuleRunArguments[2];
/** Single invalid-case entry shape. */
type RuleRunInvalidCase = RuleRunCases["invalid"][number];
/** Single valid-case entry shape. */
type RuleRunValidCase = RuleRunCases["valid"][number];

/**
 * Build a deterministic fallback label for unnamed RuleTester cases.
 *
 * @param ruleName - Rule id currently under test.
 * @param caseKind - Whether the case is valid or invalid.
 * @param caseIndex - Zero-based index in the case array.
 * @param caseFilename - Optional fixture filename for display.
 *
 * @returns Styled case label shown in Vitest output.
 */
const deriveGeneratedCaseName = (
    ruleName: string,
    caseKind: "invalid" | "valid",
    caseIndex: number,
    caseFilename?: string
): string => {
    const caseLabel = [
        pc.bold(pc.magentaBright("UNNAMED")),
        caseKind === "invalid"
            ? pc.bold(pc.red("invalid"))
            : pc.bold(pc.green("valid")),
        pc.underline(pc.yellow(`#${String(caseIndex + 1)}`)),
    ].join(" ");
    const caseSource =
        typeof caseFilename === "string" && caseFilename.length > 0
            ? pc.underline(pc.cyan(path.basename(caseFilename)))
            : pc.underline(pc.blue(ruleName));

    return `${caseSource}${pc.dim(" - ")}${caseLabel}`;
};

/**
 * Normalize RuleTester run cases so every case has a readable name.
 *
 * @param ruleName - Rule id currently under test.
 * @param runCases - Original valid/invalid case collections.
 *
 * @returns Case collections with generated names for unnamed entries.
 */
const withGeneratedRuleCaseNames = (
    ruleName: string,
    runCases: Readonly<RuleRunCases>
): RuleRunCases => {
    const normalizedInvalidCases: RuleRunCases["invalid"] =
        runCases.invalid.map(
            (entry: Readonly<RuleRunInvalidCase>, caseIndex) =>
                typeof entry.name === "string" && entry.name.length > 0
                    ? {
                          ...entry,
                          name: pc.bold(pc.cyanBright(entry.name)),
                      }
                    : {
                          ...entry,
                          name: deriveGeneratedCaseName(
                              ruleName,
                              "invalid",
                              caseIndex,
                              entry.filename
                          ),
                      }
        );

    const normalizedValidCases: RuleRunCases["valid"] = runCases.valid.map(
        (entry: Readonly<RuleRunValidCase>, caseIndex) => {
            if (typeof entry === "string") {
                return {
                    code: entry,
                    name: deriveGeneratedCaseName(ruleName, "valid", caseIndex),
                };
            }

            if (typeof entry.name === "string" && entry.name.length > 0) {
                return {
                    ...entry,
                    name: pc.bold(pc.cyanBright(entry.name)),
                };
            }

            return {
                ...entry,
                name: deriveGeneratedCaseName(
                    ruleName,
                    "valid",
                    caseIndex,
                    entry.filename
                ),
            };
        }
    );

    return {
        invalid: normalizedInvalidCases,
        valid: normalizedValidCases,
    };
};

/**
 * Patch `RuleTester#run` to inject generated case names before execution.
 *
 * @param tester - RuleTester instance to patch.
 *
 * @returns Patched RuleTester instance.
 */
const patchRuleTesterRunWithGeneratedCaseNames = (
    tester: Readonly<RuleTester>
): RuleTester => {
    const writableTester = tester as RuleTester;
    const originalRun = writableTester.run.bind(writableTester);
    writableTester.run = ((ruleName, ruleModule, runCases) => {
        (originalRun as (...args: UnknownArray) => void)(
            ruleName,
            ruleModule,
            withGeneratedRuleCaseNames(ruleName, runCases)
        );
    }) as RuleTester["run"];
    return writableTester;
};

/**
 * Apply shared RuleTester run behavior: prefer explicit per-case `name`, with
 * concise fallback names when omitted.
 *
 * @param tester - RuleTester instance to patch.
 *
 * @returns Patched tester instance.
 */
export const applySharedRuleTesterRunBehavior = (
    tester: Readonly<RuleTester>
): RuleTester => patchRuleTesterRunWithGeneratedCaseNames(tester);

/**
 * Resolve an absolute repository path from optional relative segments.
 *
 * @param segments - Optional path segments under the repository root.
 *
 * @returns Absolute path rooted at the current workspace.
 */
export const repoPath = (...segments: readonly string[]): string =>
    path.join(process.cwd(), ...segments);

/**
 * Create a RuleTester instance configured for TypeScript parser usage.
 *
 * @returns Configured RuleTester instance.
 */
export const createRuleTester = (): RuleTester =>
    applySharedRuleTesterRunBehavior(
        new RuleTester({
            languageOptions: {
                parser: tsParser,
                parserOptions: {
                    ecmaVersion: "latest",
                    sourceType: "module",
                },
            },
        })
    );

/**
 * Check whether a dynamic value is a non-null object record.
 *
 * @param value - Runtime value under inspection.
 *
 * @returns `true` when value is object-like and non-null.
 */
const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/**
 * Check whether a dynamic value looks like an ESLint rule module.
 *
 * @param value - Dynamic value loaded from plugin rule map.
 *
 * @returns `true` when value has a callable `create` method.
 */
const isRuleModule = (value: unknown): value is PluginRuleModule => {
    if (!isRecord(value)) {
        return false;
    }

    const maybeCreate = (value as { create?: unknown }).create;

    return typeof maybeCreate === "function";
};

/**
 * Lookup a rule module from the plugin by its unqualified rule id.
 *
 * @param ruleId - Rule id without the `typefest/` prefix.
 *
 * @returns Matching RuleTester-compatible rule module.
 */
export const getPluginRule = (ruleId: string): PluginRuleModule => {
    const { rules } = typefestPlugin;
    const dynamicRules = rules as UnknownRecord;
    if (!Object.hasOwn(dynamicRules, ruleId)) {
        throw new Error(`Rule '${ruleId}' is not registered in typefestPlugin`);
    }

    const rule = dynamicRules[ruleId];

    if (!isRuleModule(rule)) {
        throw new Error(`Rule '${ruleId}' is not a valid ESLint rule module`);
    }

    return rule;
};
