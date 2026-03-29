/**
 * @packageDocumentation
 * Public plugin entrypoint for eslint-plugin-typedoc exports and preset wiring.
 */

import type { ESLint, Linter } from "eslint";

import typeScriptParser from "@typescript-eslint/parser";

import packageJson from "../package.json" with { type: "json" };
import {
    type TypedocConfigName as InternalTypedocConfigName,
    typedocConfigMetadataByName,
    typedocConfigNames,
} from "./_internal/typedoc-config-references.js";
import {
    type TypedocRuleName,
    typedocRuleNames,
    typedocRules,
} from "./_internal/rules-registry.js";

/** ESLint severity used by generated preset rule maps. */
const ERROR_SEVERITY = "error" as const;

/** Default file globs targeted by plugin presets when `files` is omitted. */
const SOURCE_FILES = ["**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"] as const;

/**
 * Canonical flat-config preset keys exposed through `plugin.configs`.
 */
export type TypedocConfigName = InternalTypedocConfigName;

/**
 * Flat-config preset shape produced by this plugin.
 */
export type TypedocPresetConfig = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};

/** Contract for the `configs` object exported by this plugin. */
type TypedocConfigsContract = Record<TypedocConfigName, TypedocPresetConfig>;

/** Fully assembled plugin contract used by the runtime default export. */
type TypedocPluginContract = Omit<
    ESLint.Plugin,
    "configs" | "meta" | "rules"
> & {
    configs: TypedocConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

/**
 * Fully-qualified ESLint rule id used by this plugin.
 */
export type TypedocRuleId = `typedoc/${TypedocRuleName}`;

/**
 * ESLint-compatible rule map view of the strongly typed internal rule record.
 */
const typedocEslintRules: NonNullable<ESLint.Plugin["rules"]> &
    typeof typedocRules = typedocRules as NonNullable<ESLint.Plugin["rules"]> &
    typeof typedocRules;

/**
 * Resolve package version from package.json data.
 *
 * @param pkg - Parsed package metadata value.
 *
 * @returnsssssssssss The package version, or `0.0.0` when unavailable.
 */
const getPackageVersion = (pkg: unknown): string => {
    if (typeof pkg !== "object" || pkg === null) {
        return "0.0.0";
    }

    const version = Reflect.get(pkg, "version");

    return typeof version === "string" ? version : "0.0.0";
};

const toRulesConfig = (
    ruleNames: readonly TypedocRuleName[]
): TypedocPresetConfig["rules"] => {
    const rules: TypedocPresetConfig["rules"] = {};

    for (const ruleName of ruleNames) {
        rules[`typedoc/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
};

const presetRuleNamesByConfig: Readonly<
    Record<TypedocConfigName, readonly TypedocRuleName[]>
> = {
    all: [...typedocRuleNames],
    minimal: ["no-typedoc-tag-alias", "require-typedoc-config-options"],
    recommended: [
        "no-typedoc-tag-alias",
        "require-typedoc-config-options",
        "enforce-typedoc-tags",
        "no-unresolved-typedoc-link",
    ],
    strict: [
        "no-typedoc-tag-alias",
        "require-typedoc-config-options",
        "enforce-typedoc-tags",
        "no-unresolved-typedoc-link",
        "require-export-docs",
    ],
};

const withTypedocPlugin = (
    config: Readonly<TypedocPresetConfig>,
    plugin: Readonly<ESLint.Plugin>
): TypedocPresetConfig => {
    const existingLanguageOptions = config.languageOptions ?? {};
    const parserOptions =
        typeof existingLanguageOptions["parserOptions"] === "object" &&
        existingLanguageOptions["parserOptions"] !== null &&
        !Array.isArray(existingLanguageOptions["parserOptions"])
            ? {
                  ecmaVersion: "latest",
                  sourceType: "module",
                  ...existingLanguageOptions["parserOptions"],
              }
            : {
                  ecmaVersion: "latest",
                  sourceType: "module",
              };

    return {
        ...config,
        files: config.files ?? [...SOURCE_FILES],
        languageOptions: {
            ...existingLanguageOptions,
            parser: existingLanguageOptions["parser"] ?? typeScriptParser,
            parserOptions,
        },
        plugins: {
            ...config.plugins,
            typedoc: plugin,
        },
    };
};

const pluginForConfigs: ESLint.Plugin = {
    rules: typedocEslintRules,
};

const createTypedocConfigs = (): TypedocConfigsContract => {
    const typedocConfigs = {} as TypedocConfigsContract;

    for (const configName of typedocConfigNames) {
        const configMetadata = typedocConfigMetadataByName[configName];

        typedocConfigs[configName] = withTypedocPlugin(
            {
                name: configMetadata.presetName,
                rules: toRulesConfig(presetRuleNamesByConfig[configName]),
            },
            pluginForConfigs
        );
    }

    return typedocConfigs;
};

const typedocPlugin: TypedocPluginContract = {
    configs: createTypedocConfigs(),
    meta: {
        name: "eslint-plugin-typedoc",
        namespace: "typedoc",
        version: getPackageVersion(packageJson),
    },
    processors: {},
    rules: typedocEslintRules,
};

/**
 * Runtime type for the plugin object exported as default.
 */
export type TypedocPlugin = typeof typedocPlugin;

/**
 * Runtime type for the plugin's generated config presets.
 */
export type TypedocConfigs = TypedocPlugin["configs"];

export default typedocPlugin;
