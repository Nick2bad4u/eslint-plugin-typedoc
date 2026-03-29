/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and
 * plugin wiring.
 */
import type { Except, UnknownArray } from "type-fest";
import type ts from "typescript";

import {
    ESLintUtils,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { assertDefined, isDefined } from "ts-extras";

import type { TypefestConfigReference } from "./typefest-config-references.js";

import { registerProgramSettingsForContext } from "./plugin-settings.js";
import { getRuleCatalogEntryForRuleNameOrNull } from "./rule-catalog.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { getScopeFromContextSourceCode } from "./scope-resolution.js";
import { getVariableInScopeChain } from "./scope-variable.js";
import { getTypeCheckerIsTypeAssignableToResult } from "./type-checker-compat.js";

/**
 * Current rule-catalog revision identifier stamped into `meta.docs`.
 */
const RULE_CATALOG_ID = "R002" as const;

/**
 * Parser services and type checker bundle used by typed rules.
 */
export type TypedRuleServices = {
    checker: ts.TypeChecker;
    parserServices: ReturnType<typeof ESLintUtils.getParserServices>;
};

/** Shared typed-rule context contract used by helper utilities. */
type TypedRuleContext = Readonly<TSESLint.RuleContext<string, UnknownArray>>;

export type { TypedRuleContext };

type TypefestRuleCreator = ReturnType<
    typeof ESLintUtils.RuleCreator<TypefestRuleInputDocs>
>;

/**
 * Plugin-specific metadata extensions for `meta.docs`.
 *
 * @remarks
 * `eslint-plugin/require-meta-docs-recommended` expects `meta.docs.recommended`
 * to be boolean. Preset membership is tracked separately via
 * `meta.docs.typefestConfigs`.
 */
type TypefestRuleDocs = {
    recommended?: boolean;
    requiresTypeChecking?: boolean;
    ruleCatalogId: string;
    ruleId?: string;
    ruleNumber?: number;
    typefestConfigs?:
        | readonly TypefestConfigReference[]
        | TypefestConfigReference;
};

/**
 * Rule authoring metadata contract accepted by `RuleCreator`.
 *
 * @remarks
 * `ruleCatalogId` is injected centrally by `createTypedRule`, so authored rule
 * modules are not required to provide it.
 */
type TypefestRuleInputDocs = Except<TypefestRuleDocs, "ruleCatalogId"> & {
    ruleCatalogId?: string;
};

/**
 * Rule-creator wrapper used by all plugin rules.
 *
 * @remarks
 * This wrapper automatically registers per-program plugin settings.
 *
 * @param ruleDefinition - Rule module definition passed to
 *   `ESLintUtils.RuleCreator`.
 *
 * @returns Rule module factory output that auto-registers program settings and
 *   preserves the authored rule contract.
 */
export const createTypedRule: TypefestRuleCreator = (ruleDefinition) => {
    const catalogEntry = getRuleCatalogEntryForRuleNameOrNull(
        ruleDefinition.name
    );
    const createdRule = ESLintUtils.RuleCreator.withoutDocs(ruleDefinition);
    const ruleDocs = createdRule.meta.docs;
    assertDefined(ruleDocs);
    const canonicalDocsUrl = createRuleDocsUrl(ruleDefinition.name);

    if (typeof ruleDocs.url === "string" && ruleDocs.url !== canonicalDocsUrl) {
        throw new TypeError(
            `Rule '${ruleDefinition.name}' has non-canonical docs.url '${ruleDocs.url}'. Expected '${canonicalDocsUrl}'.`
        );
    }

    if (ruleDefinition.name.startsWith("prefer-") && catalogEntry === null) {
        throw new TypeError(
            `Rule '${ruleDefinition.name}' is missing from the stable rule catalog.`
        );
    }

    const docsWithCatalog: TSESLint.RuleMetaDataDocs & TypefestRuleDocs =
        catalogEntry === null
            ? {
                  ...ruleDocs,
                  ruleCatalogId: RULE_CATALOG_ID,
                  url: canonicalDocsUrl,
              }
            : {
                  ...ruleDocs,
                  ruleCatalogId: RULE_CATALOG_ID,
                  ruleId: catalogEntry.ruleId,
                  ruleNumber: catalogEntry.ruleNumber,
                  url: canonicalDocsUrl,
              };

    const metaDefaultOptions = createdRule.meta.defaultOptions;

    return {
        ...createdRule,
        create(context) {
            registerProgramSettingsForContext(context);

            return createdRule.create(context);
        },
        meta: {
            ...createdRule.meta,
            ...(isDefined(metaDefaultOptions)
                ? { defaultOptions: metaDefaultOptions }
                : {}),
            docs: docsWithCatalog,
        },
        name: ruleDefinition.name,
    };
};

/**
 * Retrieve parser services and type checker for typed rules.
 *
 * @param context - Rule context from the current lint evaluation.
 *
 * @returns Parser services and type checker references bound to the current
 *   program.
 *
 * @throws Throws when `parserServices.program` is unavailable, which indicates
 *   the current lint run is not configured for type-aware analysis.
 */
export const getTypedRuleServices = (
    context: TypedRuleContext
): TypedRuleServices => {
    const parserServices = ESLintUtils.getParserServices(context, true);
    const program = parserServices.program;

    if (program === null) {
        throw new Error(
            "Typed rule requires parserServices.program; ensure projectService is enabled for this lint run."
        );
    }

    return {
        checker: program.getTypeChecker(),
        parserServices,
    };
};

/**
 * Determine whether the current lint context has full type information.
 *
 * @param context - Rule context from the current lint evaluation.
 *
 * @returns `true` when parser services and `program` are available.
 */
export const hasTypeServices = (context: TypedRuleContext): boolean => {
    const parserServicesResult = safeTypeOperation({
        operation: () => ESLintUtils.getParserServices(context, true),
        reason: "typed-rule-services-check-failed",
    });

    return (
        parserServicesResult.ok && parserServicesResult.value.program !== null
    );
};

/**
 * Retrieve typed services when available, otherwise return `undefined`.
 *
 * @param context - Rule context from the current lint evaluation.
 *
 * @returns Typed services when parser services include a TypeScript program.
 */
export const getTypedRuleServicesOrUndefined = (
    context: TypedRuleContext
): TypedRuleServices | undefined =>
    hasTypeServices(context) ? getTypedRuleServices(context) : undefined;

/**
 * Determine whether one TypeScript type is assignable to another.
 *
 * @remarks
 * Uses `checker.isTypeAssignableTo` when available and falls back to strict
 * reference equality if the checker API is unavailable or throws.
 *
 * @param checker - TypeScript type checker.
 * @param sourceType - Candidate source type.
 * @param targetType - Candidate target type.
 *
 * @returns `true` when assignable; otherwise `false`.
 */
export const isTypeAssignableTo = (
    checker: Readonly<ts.TypeChecker>,
    sourceType: Readonly<ts.Type>,
    targetType: Readonly<ts.Type>
): boolean => {
    const result = safeTypeOperation({
        operation: () =>
            getTypeCheckerIsTypeAssignableToResult(
                checker,
                sourceType,
                targetType
            ),
        reason: "type-assignability-check-failed",
    });

    if (!result.ok || typeof result.value !== "boolean") {
        return sourceType === targetType;
    }

    return result.value;
};

/**
 * Resolve the type of a signature parameter by index.
 *
 * @param options - Signature parameter lookup options.
 *
 *   - `checker`: TypeScript type checker.
 *   - `index`: Parameter index in the signature.
 *   - `location`: Source location used for contextual type lookup.
 *   - `signature`: Candidate call signature.
 *
 * @returns Parameter type when available; otherwise `undefined`.
 */
export const getSignatureParameterTypeAt = (
    options: Readonly<{
        checker: ts.TypeChecker;
        index: number;
        location: ts.Node;
        signature: null | ts.Signature | undefined;
    }>
): ts.Type | undefined => {
    const { checker, index, location, signature } = options;

    const symbol = signature?.parameters[index];
    if (!symbol) {
        return undefined;
    }

    return checker.getTypeOfSymbolAtLocation(symbol, location);
};

/**
 * Determine whether an expression references an unshadowed global identifier.
 *
 * @param context - Rule context used for scope resolution.
 * @param expression - Expression to inspect.
 * @param identifierName - Expected identifier name.
 *
 * @returns `true` when the expression is an Identifier with the expected name
 *   and resolves to the global binding.
 */
export const isGlobalIdentifierNamed = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>,
    identifierName: string
): expression is TSESTree.Identifier => {
    if (
        expression.type !== "Identifier" ||
        expression.name !== identifierName
    ) {
        return false;
    }

    const result = safeTypeOperation({
        operation: () => {
            const initialScope = getScopeFromContextSourceCode(
                context,
                expression
            );

            if (initialScope === null) {
                return true;
            }

            const variable = getVariableInScopeChain(
                initialScope,
                identifierName
            );

            return variable === null || variable.defs.length === 0;
        },
        reason: "scope-resolution-failed",
    });

    if (!result.ok) {
        return false;
    }

    return result.value;
};

/**
 * Determine whether an expression references the global `undefined` binding
 * (not a shadowed user-defined symbol).
 *
 * @param context - Rule context used for scope resolution.
 * @param expression - Expression to inspect.
 *
 * @returns `true` when the expression is an Identifier named `undefined` that
 *   resolves to the global binding.
 */
export const isGlobalUndefinedIdentifier = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Identifier =>
    isGlobalIdentifierNamed(context, expression, "undefined");
