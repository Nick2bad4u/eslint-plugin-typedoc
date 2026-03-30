/**
 * Canonical TypeDoc preset/config references used by plugin metadata and docs
 * sync.
 */

/** Supported preset keys exported by the plugin. */
export const typedocConfigNames = [
    "minimal",
    "recommended",
    "strict",
    "all",
] as const;

/** Supported preset-name union exported by the plugin. */
export type TypedocConfigName = (typeof typedocConfigNames)[number];

const typedocConfigReferenceToNameValue: Readonly<{
    "typedoc.configs.all": "all";
    "typedoc.configs.minimal": "minimal";
    "typedoc.configs.recommended": "recommended";
    "typedoc.configs.strict": "strict";
}> = {
    "typedoc.configs.all": "all",
    "typedoc.configs.minimal": "minimal",
    "typedoc.configs.recommended": "recommended",
    "typedoc.configs.strict": "strict",
};

/** Canonical string references used inside rule metadata to indicate presets. */
export const typedocConfigReferenceToName: typeof typedocConfigReferenceToNameValue =
    typedocConfigReferenceToNameValue;

/** Metadata attached to each published preset. */
export type TypedocConfigMetadata = Readonly<{
    icon: string;
    presetName: string;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

/** String-literal references accepted in rule metadata for preset membership. */
export type TypedocConfigReference = keyof typeof typedocConfigReferenceToName;

const typedocConfigMetadataByNameValue: Readonly<
    Record<TypedocConfigName, TypedocConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "typedoc/all",
        readmeOrder: 4,
        requiresTypeChecking: false,
    },
    minimal: {
        icon: "🟢",
        presetName: "typedoc/minimal",
        readmeOrder: 1,
        requiresTypeChecking: false,
    },
    recommended: {
        icon: "🔵",
        presetName: "typedoc/recommended",
        readmeOrder: 2,
        requiresTypeChecking: false,
    },
    strict: {
        icon: "🟠",
        presetName: "typedoc/strict",
        readmeOrder: 3,
        requiresTypeChecking: false,
    },
};

/** Metadata table for all published presets. */
export const typedocConfigMetadataByName: typeof typedocConfigMetadataByNameValue =
    typedocConfigMetadataByNameValue;

/** Preset keys sorted in the order they should appear in README/docs tables. */
export const typedocConfigNamesByReadmeOrder: readonly TypedocConfigName[] = [
    ...typedocConfigNames,
].toSorted(
    (left, right) =>
        typedocConfigMetadataByName[left].readmeOrder -
        typedocConfigMetadataByName[right].readmeOrder
);

const typedocConfigNameSet = new Set<TypedocConfigName>(typedocConfigNames);

/** Determine whether a string is a supported preset key. */
export const isTypedocConfigName = (
    value: string
): value is TypedocConfigName =>
    typedocConfigNameSet.has(value as TypedocConfigName);

/** Determine whether a string is a supported preset reference literal. */
export const isTypedocConfigReference = (
    value: string
): value is TypedocConfigReference =>
    Object.hasOwn(typedocConfigReferenceToName, value);
