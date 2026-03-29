/**
 * @packageDocumentation
 * Shared typefest preset/config reference constants and type guards.
 */
import { objectHasOwn } from "ts-extras";

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
export const typefestConfigNames = [
    "all",
    "experimental",
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
    "ts-extras/type-guards",
    "type-fest/types",
] as const;

/** Metadata contract shared across preset wiring, docs, and README rendering. */
export type TypefestConfigMetadata = Readonly<{
    icon: string;
    presetName: `typefest:${TypefestConfigName}`;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

/** Canonical flat-config preset key type exposed through `plugin.configs`. */
export type TypefestConfigName = (typeof typefestConfigNames)[number];

/**
 * Canonical metadata for every exported `typefest` preset key.
 *
 * @remarks
 * This is the single source of truth for:
 *
 * - Preset display order in generated README tables,
 * - Preset icon mapping,
 * - Preset runtime flat-config names, and
 * - Preset type-checking requirements.
 */
export const typefestConfigMetadataByName: Readonly<
    Record<TypefestConfigName, TypefestConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "typefest:all",
        readmeOrder: 5,
        requiresTypeChecking: true,
    },
    experimental: {
        icon: "🧪",
        presetName: "typefest:experimental",
        readmeOrder: 6,
        requiresTypeChecking: true,
    },
    minimal: {
        icon: "🟢",
        presetName: "typefest:minimal",
        readmeOrder: 1,
        requiresTypeChecking: false,
    },
    recommended: {
        icon: "🟡",
        presetName: "typefest:recommended",
        readmeOrder: 2,
        requiresTypeChecking: false,
    },
    "recommended-type-checked": {
        icon: "🟠",
        presetName: "typefest:recommended-type-checked",
        readmeOrder: 3,
        requiresTypeChecking: true,
    },
    strict: {
        icon: "🔴",
        presetName: "typefest:strict",
        readmeOrder: 4,
        requiresTypeChecking: true,
    },
    "ts-extras/type-guards": {
        icon: "✴️",
        presetName: "typefest:ts-extras/type-guards",
        readmeOrder: 8,
        requiresTypeChecking: true,
    },
    "type-fest/types": {
        icon: "💠",
        presetName: "typefest:type-fest/types",
        readmeOrder: 7,
        requiresTypeChecking: false,
    },
};

/** Stable README legend/rendering order for preset icons. */
export const typefestConfigNamesByReadmeOrder: readonly TypefestConfigName[] = [
    "minimal",
    "recommended",
    "recommended-type-checked",
    "strict",
    "all",
    "experimental",
    "type-fest/types",
    "ts-extras/type-guards",
];

/** Metadata references supported in `meta.docs.recommended`. */
export const typefestConfigReferenceToName: Readonly<{
    "typefest.configs.all": "all";
    "typefest.configs.experimental": "experimental";
    "typefest.configs.minimal": "minimal";
    "typefest.configs.recommended": "recommended";
    "typefest.configs.recommended-type-checked": "recommended-type-checked";
    "typefest.configs.strict": "strict";
    "typefest.configs.ts-extras/type-guards": "ts-extras/type-guards";
    "typefest.configs.type-fest/types": "type-fest/types";
    'typefest.configs["recommended-type-checked"]': "recommended-type-checked";
    'typefest.configs["ts-extras/type-guards"]': "ts-extras/type-guards";
    'typefest.configs["type-fest/types"]': "type-fest/types";
}> = {
    "typefest.configs.all": "all",
    "typefest.configs.experimental": "experimental",
    "typefest.configs.minimal": "minimal",
    "typefest.configs.recommended": "recommended",
    "typefest.configs.recommended-type-checked": "recommended-type-checked",
    "typefest.configs.strict": "strict",
    "typefest.configs.ts-extras/type-guards": "ts-extras/type-guards",
    "typefest.configs.type-fest/types": "type-fest/types",
    'typefest.configs["recommended-type-checked"]': "recommended-type-checked",
    'typefest.configs["ts-extras/type-guards"]': "ts-extras/type-guards",
    'typefest.configs["type-fest/types"]': "type-fest/types",
};

/** Fully-qualified preset reference type accepted in docs metadata. */
export type TypefestConfigReference =
    keyof typeof typefestConfigReferenceToName;

/**
 * Check whether a string is a supported `meta.docs.recommended` reference.
 */
export const isTypefestConfigReference = (
    value: string
): value is TypefestConfigReference =>
    objectHasOwn(typefestConfigReferenceToName, value);
