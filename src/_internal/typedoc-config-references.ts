/**
 * @packageDocumentation
 * Canonical TypeDoc preset/config references used by plugin metadata and docs sync.
 */

export const typedocConfigNames = [
    "minimal",
    "recommended",
    "strict",
    "all",
] as const;

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

export const typedocConfigReferenceToName: typeof typedocConfigReferenceToNameValue =
    typedocConfigReferenceToNameValue;

export type TypedocConfigMetadata = Readonly<{
    icon: string;
    presetName: string;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

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

export const typedocConfigMetadataByName: typeof typedocConfigMetadataByNameValue =
    typedocConfigMetadataByNameValue;

export const typedocConfigNamesByReadmeOrder: readonly TypedocConfigName[] = [
    ...typedocConfigNames,
].toSorted(
    (left, right) =>
        typedocConfigMetadataByName[left].readmeOrder -
        typedocConfigMetadataByName[right].readmeOrder
);

const typedocConfigNameSet = new Set<TypedocConfigName>(typedocConfigNames);

export const isTypedocConfigName = (
    value: string
): value is TypedocConfigName =>
    typedocConfigNameSet.has(value as TypedocConfigName);

export const isTypedocConfigReference = (
    value: string
): value is TypedocConfigReference =>
    Object.hasOwn(typedocConfigReferenceToName, value);
