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

export const typedocConfigReferenceToName = {
    "typedoc.configs.all": "all",
    "typedoc.configs.minimal": "minimal",
    "typedoc.configs.recommended": "recommended",
    "typedoc.configs.strict": "strict",
} as const satisfies Record<string, TypedocConfigName>;

export type TypedocConfigReference = keyof typeof typedocConfigReferenceToName;

export type TypedocConfigMetadata = Readonly<{
    icon: string;
    presetName: string;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

export const typedocConfigMetadataByName = {
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
} as const satisfies Record<TypedocConfigName, TypedocConfigMetadata>;

export const typedocConfigNamesByReadmeOrder = [...typedocConfigNames].toSorted(
    (left, right) =>
        typedocConfigMetadataByName[left].readmeOrder -
        typedocConfigMetadataByName[right].readmeOrder
);

export const isTypedocConfigName = (
    value: string
): value is TypedocConfigName =>
    typedocConfigNames.some((configName) => configName === value);

export const isTypedocConfigReference = (
    value: string
): value is TypedocConfigReference =>
    Object.hasOwn(typedocConfigReferenceToName, value);
