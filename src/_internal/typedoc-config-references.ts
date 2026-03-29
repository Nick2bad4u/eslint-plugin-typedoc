/**
 * @packageDocumentation
 * Shared preset/config reference constants for eslint-plugin-typedoc.
 */

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
export const typedocConfigNames = [
    "minimal",
    "recommended",
    "strict",
    "all",
] as const;

/** Canonical flat-config preset key type exposed through `plugin.configs`. */
export type TypedocConfigName = (typeof typedocConfigNames)[number];

/** Metadata contract shared across preset wiring, docs, and README rendering. */
export type TypedocConfigMetadata = Readonly<{
    icon: string;
    presetName: `typedoc:${TypedocConfigName}`;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

/**
 * Canonical metadata for every exported `typedoc` preset key.
 */
export const typedocConfigMetadataByName: Readonly<
    Record<TypedocConfigName, TypedocConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "typedoc:all",
        readmeOrder: 4,
        requiresTypeChecking: false,
    },
    minimal: {
        icon: "🟢",
        presetName: "typedoc:minimal",
        readmeOrder: 1,
        requiresTypeChecking: false,
    },
    recommended: {
        icon: "🟡",
        presetName: "typedoc:recommended",
        readmeOrder: 2,
        requiresTypeChecking: false,
    },
    strict: {
        icon: "🔴",
        presetName: "typedoc:strict",
        readmeOrder: 3,
        requiresTypeChecking: false,
    },
};

/** Stable README legend/rendering order for preset icons. */
export const typedocConfigNamesByReadmeOrder: readonly TypedocConfigName[] = [
    "minimal",
    "recommended",
    "strict",
    "all",
];

/** Metadata references supported in `meta.docs.typedocConfigs`. */
export const typedocConfigReferenceToName: Readonly<{
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

/** Fully-qualified preset reference type accepted in docs metadata. */
export type TypedocConfigReference = keyof typeof typedocConfigReferenceToName;

/**
 * Check whether a string is a supported `meta.docs.typedocConfigs` reference.
 *
 * @param value
 *
 * @returnssssssssss
 *
 * @returnssssssss
 *
 * @returnssssss
 *
 * @returnssss
 *
 * @returnss
 */
export const isTypedocConfigReference = (
    value: string
): value is TypedocConfigReference =>
    Object.hasOwn(typedocConfigReferenceToName, value);
