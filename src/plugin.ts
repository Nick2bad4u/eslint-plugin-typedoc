/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typedoc exports and preset wiring.
 */

import type { ESLint, Linter } from "eslint";
import type { Except } from "type-fest";

import typeScriptParser from "@typescript-eslint/parser";
import { objectEntries, objectHasOwn, safeCastTo } from "ts-extras";

// eslint-disable-next-line import-x/extensions -- JSON modules require explicit `.json` specifiers.
import packageJson from "../package.json" with { type: "json" };
import {
    deriveRuleDocsMetadataByName,
    deriveRulePresetMembershipByRuleName,
} from "./_internal/rule-docs-metadata.js";
import { type RuleWithDocs, typedocRules } from "./_internal/rules-registry.js";
import { createSortedCopy } from "./_internal/sorted-copy.js";
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

type EslintRuleMap = NonNullable<ESLint.Plugin["rules"]>;
type EslintRuleModule = EslintRuleMap[string];
type FlatConfig = Linter.Config;
type FlatLanguageOptions = NonNullable<FlatConfig["languageOptions"]>;
type FlatParserOptions = NonNullable<FlatLanguageOptions["parserOptions"]>;
type RulesConfig = TypedocPresetConfig["rules"];
type TypedocConfigsContract = Record<TypedocConfigName, TypedocPresetConfig>;

type TypedocPluginContract = Except<ESLint.Plugin, "configs" | "rules"> & {
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

    const version: unknown = Reflect.get(pkg, "version");

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

const isTypedocRuleName = (ruleName: string): ruleName is TypedocRuleName =>
    objectHasOwn(typedocRules, ruleName);

const toEslintRuleModule = (
    ruleModule: Readonly<RuleWithDocs>
): EslintRuleModule => {
    const adaptedCreate: EslintRuleModule["create"] = (context) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint v10 and typescript-eslint expose equivalent runtime context values via different type packages.
        ruleModule.create(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Runtime context object is forwarded unchanged across the type-interop boundary.
            context as unknown as Parameters<RuleWithDocs["create"]>[0]
        ) as unknown as ReturnType<EslintRuleModule["create"]>;

    return {
        create: adaptedCreate,
        meta: {
            ...ruleModule.meta,
            defaultOptions: [...(ruleModule.meta.defaultOptions ?? [])],
        },
    };
};

const typedocEslintRules: EslintRuleMap = {};

for (const [ruleName, ruleModule] of objectEntries(typedocRules)) {
    typedocEslintRules[ruleName] = toEslintRuleModule(ruleModule);
}

const ruleDocsMetadataByRuleName = deriveRuleDocsMetadataByName(typedocRules);
const rulePresetMembershipByRuleName = deriveRulePresetMembershipByRuleName(
    ruleDocsMetadataByRuleName
);

const createEmptyPresetRuleMap = (): Record<
    TypedocConfigName,
    TypedocRuleName[]
> => ({
    all: [],
    jsdoc: [],
    markdown: [],
    minimal: [],
    recommended: [],
    strict: [],
    tsdoc: [],
});

const dedupeRuleNames = (
    ruleNames: readonly TypedocRuleName[]
): TypedocRuleName[] => [...new Set(ruleNames)];

const presetRuleNamesByConfig = (() => {
    const map = createEmptyPresetRuleMap();

    for (const [ruleName, configNames] of objectEntries(
        rulePresetMembershipByRuleName
    )) {
        if (!isTypedocRuleName(ruleName)) {
            continue;
        }

        for (const configName of configNames) {
            map[configName].push(ruleName);
        }
    }

    for (const configName of typedocConfigNames) {
        map[configName] = [
            ...createSortedCopy(
                dedupeRuleNames(map[configName]),
                (left, right) => left.localeCompare(right)
            ),
        ];
    }

    return safeCastTo<
        Readonly<Record<TypedocConfigName, readonly TypedocRuleName[]>>
    >(map);
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

const createTypedocPresetConfig = (
    configName: TypedocConfigName
): TypedocPresetConfig => {
    const configMetadata = typedocConfigMetadataByName[configName];
    const presetRuleNames = presetRuleNamesByConfig[configName];

    return withTypedocPlugin(
        {
            name: configMetadata.presetName,
            rules: errorRulesFor(presetRuleNames),
        },
        pluginForConfigs
    );
};

const createTypedocConfigsDefinition = (): TypedocConfigsContract => ({
    all: createTypedocPresetConfig("all"),
    jsdoc: createTypedocPresetConfig("jsdoc"),
    markdown: createTypedocPresetConfig("markdown"),
    minimal: createTypedocPresetConfig("minimal"),
    recommended: createTypedocPresetConfig("recommended"),
    strict: createTypedocPresetConfig("strict"),
    tsdoc: createTypedocPresetConfig("tsdoc"),
});

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
