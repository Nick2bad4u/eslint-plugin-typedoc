/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typedoc exports and preset wiring.
 */

import type { ESLint, Linter } from "eslint";

import typeScriptParser from "@typescript-eslint/parser";

import packageJson from "../package.json" with { type: "json" };
import {
    deriveRuleDocsMetadataByName,
    deriveRulePresetMembershipByRuleName,
} from "./_internal/rule-docs-metadata.js";
import { typedocRules } from "./_internal/rules-registry.js";
import { createLocaleSortedStringCopy } from "./_internal/sorted-copy.js";
import {
    type TypedocConfigName as InternalTypedocConfigName,
    typedocConfigMetadataByName,
    typedocConfigNames,
} from "./_internal/typedoc-config-references.js";

const ERROR_SEVERITY = "error" as const;
const TYPE_SCRIPT_FILES = ["**/*.{ts,tsx,mts,cts}"] as const;

/** Public preset-name union exposed by the plugin runtime. */
export type TypedocConfigName = InternalTypedocConfigName;

/** Flat-config preset shape exported from `plugin.configs`. */
export type TypedocPresetConfig = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};

type FlatConfig = Linter.Config;
type FlatLanguageOptions = NonNullable<FlatConfig["languageOptions"]>;
type FlatParserOptions = NonNullable<FlatLanguageOptions["parserOptions"]>;
type RulesConfig = TypedocPresetConfig["rules"];
type TypedocConfigsContract = Record<TypedocConfigName, TypedocPresetConfig>;

type TypedocPluginContract = Omit<ESLint.Plugin, "configs" | "rules"> & {
    configs: TypedocConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

const getPackageVersion = (pkg: unknown): string => {
    if (typeof pkg !== "object" || pkg === null) {
        return "0.0.0";
    }

    const version = Reflect.get(pkg, "version");

    return typeof version === "string" ? version : "0.0.0";
};

const typeScriptParserValue: FlatLanguageOptions["parser"] = typeScriptParser;

const defaultParserOptions = {
    ecmaVersion: "latest",
    sourceType: "module",
} satisfies FlatParserOptions;

const normalizeParserOptions = (
    parserOptions: FlatLanguageOptions["parserOptions"]
): FlatParserOptions =>
    parserOptions !== null &&
    typeof parserOptions === "object" &&
    !Array.isArray(parserOptions)
        ? { ...parserOptions }
        : { ...defaultParserOptions };

/** Fully qualified rule-id format used by this plugin. */
export type TypedocRuleId = `typedoc/${TypedocRuleName}`;
/** Unqualified rule-name union exposed by this plugin. */
export type TypedocRuleName = keyof typeof typedocRules;

const typedocEslintRules = typedocRules as NonNullable<ESLint.Plugin["rules"]> &
    typeof typedocRules;

const ruleDocsMetadataByRuleName = deriveRuleDocsMetadataByName(typedocRules);
const rulePresetMembershipByRuleName = deriveRulePresetMembershipByRuleName(
    ruleDocsMetadataByRuleName
);

const createEmptyPresetRuleMap = (): Record<
    TypedocConfigName,
    TypedocRuleName[]
> => {
    const map = {} as Record<TypedocConfigName, TypedocRuleName[]>;

    for (const configName of typedocConfigNames) {
        map[configName] = [];
    }

    return map;
};

const dedupeRuleNames = (
    ruleNames: readonly TypedocRuleName[]
): TypedocRuleName[] => [...new Set(ruleNames)];

const presetRuleNamesByConfig = (() => {
    const map = createEmptyPresetRuleMap();

    for (const [ruleName, configNames] of Object.entries(
        rulePresetMembershipByRuleName
    ) as readonly (readonly [
        TypedocRuleName,
        readonly TypedocConfigName[],
    ])[]) {
        for (const configName of configNames) {
            map[configName].push(ruleName);
        }
    }

    for (const configName of typedocConfigNames) {
        map[configName] = createLocaleSortedStringCopy(
            dedupeRuleNames(map[configName])
        ) as TypedocRuleName[];
    }

    return map as Readonly<
        Record<TypedocConfigName, readonly TypedocRuleName[]>
    >;
})();

const errorRulesFor = (ruleNames: readonly TypedocRuleName[]): RulesConfig => {
    const rules: RulesConfig = {};

    for (const ruleName of ruleNames) {
        rules[`typedoc/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
};

const withTypedocPlugin = (
    config: Readonly<TypedocPresetConfig>,
    plugin: Readonly<ESLint.Plugin>
): TypedocPresetConfig => {
    const existingLanguageOptions = config.languageOptions ?? {};
    const parserOptions = normalizeParserOptions(
        existingLanguageOptions["parserOptions"]
    );

    const languageOptions: FlatLanguageOptions = {
        ...existingLanguageOptions,
        parser: existingLanguageOptions["parser"] ?? typeScriptParserValue,
        parserOptions,
    };

    return {
        ...config,
        files: config.files ?? [...TYPE_SCRIPT_FILES],
        languageOptions,
        plugins: {
            ...config.plugins,
            typedoc: plugin,
        },
    };
};

const pluginForConfigs: ESLint.Plugin = {
    rules: typedocEslintRules,
};

const createTypedocConfigsDefinition = (): TypedocConfigsContract => {
    const configs = {} as TypedocConfigsContract;

    for (const configName of typedocConfigNames) {
        const configMetadata = typedocConfigMetadataByName[configName];
        const presetRuleNames = presetRuleNamesByConfig[configName];

        configs[configName] = withTypedocPlugin(
            {
                name: configMetadata.presetName,
                rules: errorRulesFor(presetRuleNames),
            },
            pluginForConfigs
        );
    }

    return configs;
};

const typedocConfigs: TypedocConfigsContract = createTypedocConfigsDefinition();

/** Runtime type for the exported preset map. */
export type TypedocConfigs = typeof typedocConfigs;

/** Main plugin runtime object exported as default. */
const typedocPlugin: TypedocPluginContract = {
    configs: typedocConfigs,
    meta: {
        name: "eslint-plugin-typedoc",
        namespace: "typedoc",
        version: getPackageVersion(packageJson),
    },
    processors: {},
    rules: typedocEslintRules,
};

/** Runtime type of the plugin default export. */
export type TypedocPlugin = typeof typedocPlugin;

export default typedocPlugin;
