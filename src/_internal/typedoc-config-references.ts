/**
 * Canonical TypeDoc preset/config references used by plugin metadata and docs
 * sync.
 */

import type { ArrayValues } from "type-fest";

import { arrayIncludes, objectHasOwn } from "ts-extras";

import { createSortedCopy } from "./sorted-copy.js";

/** Supported preset keys exported by the plugin. */
export const typedocConfigNames = [
    "all",
    "jsdoc",
    "markdown",
    "minimal",
    "recommended",
    "strict",
    "tsdoc",
] as const;

/** Supported preset-name union exported by the plugin. */
export type TypedocConfigName = ArrayValues<typeof typedocConfigNames>;

const typedocConfigReferenceToNameValue: Readonly<{
    "typedoc.configs.all": "all";
    "typedoc.configs.jsdoc": "jsdoc";
    "typedoc.configs.markdown": "markdown";
    "typedoc.configs.minimal": "minimal";
    "typedoc.configs.recommended": "recommended";
    "typedoc.configs.strict": "strict";
    "typedoc.configs.tsdoc": "tsdoc";
}> = {
    "typedoc.configs.all": "all",
    "typedoc.configs.jsdoc": "jsdoc",
    "typedoc.configs.markdown": "markdown",
    "typedoc.configs.minimal": "minimal",
    "typedoc.configs.recommended": "recommended",
    "typedoc.configs.strict": "strict",
    "typedoc.configs.tsdoc": "tsdoc",
};

/** Canonical string references used inside rule metadata to indicate presets. */
export const typedocConfigReferenceToName: typeof typedocConfigReferenceToNameValue =
    typedocConfigReferenceToNameValue;

/** Metadata attached to each published preset. */
export type TypedocConfigMetadata = Readonly<{
    icon: string;
    presetName: string;
    readmeOrder: number;
}>;

/** String-literal references accepted in rule metadata for preset membership. */
export type TypedocConfigReference = keyof typeof typedocConfigReferenceToName;

const typedocConfigMetadataByNameValue: Readonly<
    Record<TypedocConfigName, TypedocConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "typedoc/all",
        readmeOrder: 7,
    },
    jsdoc: {
        icon: "📘",
        presetName: "typedoc/jsdoc",
        readmeOrder: 5,
    },
    markdown: {
        icon: "📝",
        presetName: "typedoc/markdown",
        readmeOrder: 3,
    },
    minimal: {
        icon: "🟢",
        presetName: "typedoc/minimal",
        readmeOrder: 1,
    },
    recommended: {
        icon: "🔵",
        presetName: "typedoc/recommended",
        readmeOrder: 2,
    },
    strict: {
        icon: "🟠",
        presetName: "typedoc/strict",
        readmeOrder: 6,
    },
    tsdoc: {
        icon: "📗",
        presetName: "typedoc/tsdoc",
        readmeOrder: 4,
    },
};

/** Metadata table for all published presets. */
export const typedocConfigMetadataByName: typeof typedocConfigMetadataByNameValue =
    typedocConfigMetadataByNameValue;

/**
 * Preset keys sorted in the order they should appear in README/docs tables.
 *
 * @public Consumed by repository synchronization scripts from built output.
 */
export const typedocConfigNamesByReadmeOrder: readonly TypedocConfigName[] = [
    ...createSortedCopy(
        typedocConfigNames,
        (left, right) =>
            typedocConfigMetadataByName[left].readmeOrder -
            typedocConfigMetadataByName[right].readmeOrder
    ),
];

/** Determine whether a string is a supported preset key. */
export const isTypedocConfigName = (
    value: string
): value is TypedocConfigName => arrayIncludes(typedocConfigNames, value);

/** Determine whether a string is a supported preset reference literal. */
export const isTypedocConfigReference = (
    value: string
): value is TypedocConfigReference =>
    objectHasOwn(typedocConfigReferenceToName, value);
