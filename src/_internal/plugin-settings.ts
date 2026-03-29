/**
 * @packageDocumentation
 * Parsing and memoization helpers for plugin-level runtime settings.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { JsonObject, UnknownArray } from "type-fest";

import { isPresent, objectHasOwn } from "ts-extras";

import { getProgramNode } from "./ast-node.js";

/** Top-level `settings` key for this plugin. */
const TYPEFEST_SETTINGS_KEY = "typefest";

/** Flag that disables all plugin autofix behavior. */
const DISABLE_ALL_AUTOFIXES_KEY = "disableAllAutofixes";

/** Flag that disables import-insertion fix helpers only. */
const DISABLE_IMPORT_INSERTION_FIXES_KEY = "disableImportInsertionFixes";

/**
 * Normalized per-program settings consumed by fix-generation helpers.
 */
type ProgramSettings = {
    disableAllAutofixes: boolean;
    disableImportInsertionFixes: boolean;
};

/**
 * Cache of parsed settings keyed by the Program node for the active file.
 */
const settingsByProgram = new WeakMap<TSESTree.Program, ProgramSettings>();

/**
 * Narrow an unknown value to a JSON-object-like record.
 *
 * @param value - Value to narrow.
 *
 * @returns `true` when the value is a non-null, non-array object.
 */
const isObject = (value: unknown): value is Readonly<JsonObject> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Extract the `settings.typefest` object when present and valid.
 *
 * @param settings - ESLint settings value from rule context.
 *
 * @returns Parsed `settings.typefest` object when valid; otherwise `null`.
 */
const getTypefestSettings = (
    settings: unknown
): null | Readonly<JsonObject> => {
    if (!isObject(settings)) {
        return null;
    }

    const typefestSettings = settings[TYPEFEST_SETTINGS_KEY];

    return isObject(typefestSettings) ? typefestSettings : null;
};

/**
 * Read a strict boolean flag (`true`) from a JSON object by key.
 *
 * @param object - Source settings object.
 * @param key - Flag key to read.
 *
 * @returns `true` only when the key exists and equals literal `true`.
 */
const readBooleanFlag = (object: Readonly<JsonObject>, key: string): boolean =>
    objectHasOwn(object, key) && object[key] === true;

/**
 * Reads the import-insertion disable flag from plugin settings.
 *
 * @param settings - ESLint settings value from rule context.
 *
 * @returns `true` when import insertion fixes are explicitly disabled.
 */
const readDisableImportInsertionFixesFromSettings = (
    settings: unknown
): boolean => {
    const typefestSettings = getTypefestSettings(settings);
    if (!isPresent(typefestSettings)) {
        return false;
    }

    return readBooleanFlag(
        typefestSettings,
        DISABLE_IMPORT_INSERTION_FIXES_KEY
    );
};

/**
 * Reads the global autofix disable flag from plugin settings.
 *
 * @param settings - ESLint settings value from rule context.
 *
 * @returns `true` when all plugin autofixes are explicitly disabled.
 */
const readDisableAllAutofixesFromSettings = (settings: unknown): boolean => {
    const typefestSettings = getTypefestSettings(settings);
    if (!isPresent(typefestSettings)) {
        return false;
    }

    return readBooleanFlag(typefestSettings, DISABLE_ALL_AUTOFIXES_KEY);
};

/**
 * Guard values suitable for WeakMap object keys.
 */
const isWeakMapKeyObject = (value: unknown): value is object =>
    typeof value === "object" && value !== null;

/**
 * Register parsed plugin settings for the current file program.
 *
 * @param context - Active ESLint rule context.
 *
 * @returns Memoized immutable settings for the context's program node.
 */
export const registerProgramSettingsForContext = (
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>
): Readonly<ProgramSettings> => {
    const programNode = context.sourceCode.ast;

    const disableAllAutofixes = readDisableAllAutofixesFromSettings(
        context.settings
    );
    const disableImportInsertionFixes =
        disableAllAutofixes ||
        readDisableImportInsertionFixesFromSettings(context.settings);

    const parsedSettings: Readonly<ProgramSettings> = Object.freeze({
        disableAllAutofixes,
        disableImportInsertionFixes,
    });

    if (!isWeakMapKeyObject(programNode)) {
        return parsedSettings;
    }

    const existingProgramSettings = settingsByProgram.get(programNode);
    if (isPresent(existingProgramSettings)) {
        return existingProgramSettings;
    }

    settingsByProgram.set(programNode, parsedSettings);

    return parsedSettings;
};

/**
 * Determine whether import insertion autofixes are globally disabled for the
 * file containing the provided node.
 *
 * @param node - AST node used to resolve the enclosing Program.
 *
 * @returns `true` when import insertion fixes should be suppressed.
 */
export const isImportInsertionFixesDisabledForNode = (
    node: Readonly<TSESTree.Node>
): boolean => {
    const programNode = getProgramNode(node);
    if (!isPresent(programNode)) {
        return false;
    }

    const settings = settingsByProgram.get(programNode);

    return settings?.disableImportInsertionFixes === true;
};
