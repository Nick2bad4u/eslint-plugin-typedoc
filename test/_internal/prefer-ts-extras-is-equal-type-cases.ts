/**
 * @packageDocumentation
 * Shared code fixtures for `prefer-ts-extras-is-equal-type` tests.
 */

import { readTypedFixture } from "./typed-rule-tester";

export const validFixtureName = "prefer-ts-extras-is-equal-type.valid.ts";
export const invalidFixtureName = "prefer-ts-extras-is-equal-type.invalid.ts";

export const invalidFixtureCode: string = readTypedFixture(invalidFixtureName);

const replaceOrThrow = ({
    replacement,
    sourceText,
    target,
}: Readonly<{
    replacement: string;
    sourceText: string;
    target: string;
}>): string => {
    const replacedText = sourceText.replace(target, replacement);

    if (replacedText === sourceText) {
        throw new TypeError(
            `Expected prefer-ts-extras-is-equal-type fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const invalidFixtureCodeWithTsExtrasImport: string = replaceOrThrow({
    replacement:
        'import type { IsEqual } from "type-fest";\nimport { isEqualType } from "ts-extras";\r\n',
    sourceText: invalidFixtureCode,
    target: 'import type { IsEqual } from "type-fest";\r\n',
});

export const invalidFixtureDirectEqualSuggestionOutput: string = replaceOrThrow(
    {
        replacement:
            "const directEqualCheck = isEqualType<string, string>() || true;",
        sourceText: invalidFixtureCodeWithTsExtrasImport,
        target: "const directEqualCheck: IsEqual<string, string> = true;",
    }
);

export const invalidFixtureDirectUnequalSuggestionOutput: string =
    replaceOrThrow({
        replacement:
            "const directUnequalCheck = isEqualType<number, string>() && false;",
        sourceText: invalidFixtureCodeWithTsExtrasImport,
        target: "const directUnequalCheck: IsEqual<number, string> = false;",
    });

export const invalidFixtureNamespaceSuggestionOutput: string = replaceOrThrow({
    replacement: 'const namespaceEqualCheck = isEqualType<"a", "a">() || true;',
    sourceText: invalidFixtureCodeWithTsExtrasImport,
    target: 'const namespaceEqualCheck: TypeFest.IsEqual<"a", "a"> = true;',
});

export const inlineInvalidAliasedImportCode: string = [
    'import type { IsEqual as IsEqualAlias } from "type-fest";',
    "",
    "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
    "",
    "Boolean(aliasedEqualCheck);",
].join("\n");

export const inlineInvalidAliasedImportSuggestionOutput: string =
    replaceOrThrow({
        replacement:
            "const aliasedEqualCheck = isEqualType<string, string>() || true;",
        sourceText: replaceOrThrow({
            replacement:
                'import type { IsEqual as IsEqualAlias } from "type-fest";\nimport { isEqualType } from "ts-extras";',
            sourceText: inlineInvalidAliasedImportCode,
            target: 'import type { IsEqual as IsEqualAlias } from "type-fest";',
        }),
        target: "const aliasedEqualCheck: IsEqualAlias<string, string> = true;",
    });

export const inlineInvalidAliasedTsExtrasImportCode: string = [
    'import { isEqualType as isEqualTypeAlias } from "ts-extras";',
    'import type { IsEqual } from "type-fest";',
    "",
    "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(aliasedRuntimeHelperCheck);",
].join("\n");

export const inlineInvalidAliasedTsExtrasImportSuggestionOutput: string =
    replaceOrThrow({
        replacement:
            "const aliasedRuntimeHelperCheck = isEqualTypeAlias<string, string>() || true;",
        sourceText: inlineInvalidAliasedTsExtrasImportCode,
        target: "const aliasedRuntimeHelperCheck: IsEqual<string, string> = true;",
    });

export const inlineValidTypeAliasReferenceCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "type EqualityFlag = IsEqual<string, string>;",
    "const equalityFlag: EqualityFlag = true;",
    "",
    "Boolean(equalityFlag);",
].join("\n");

export const inlineValidNonBooleanInitializerCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const equalityFlag: IsEqual<string, string> = true as const;",
    "",
    "Boolean(equalityFlag);",
].join("\n");

export const inlineValidNonBooleanLiteralInitializerCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const nonBooleanLiteralCheck: IsEqual<string, string> = 1;",
    "",
    "Boolean(nonBooleanLiteralCheck);",
].join("\n");

export const inlineValidObjectPatternDeclaratorCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const { equalityFlag }: { equalityFlag: IsEqual<string, string> } = {",
    "    equalityFlag: true,",
    "};",
    "",
    "Boolean(equalityFlag);",
].join("\n");

export const inlineValidNamespaceNonIsEqualCode: string = [
    'import type * as TypeFest from "type-fest";',
    "",
    'const value: TypeFest.Promisable<string> = "monitor";',
    "",
    "Boolean(value);",
].join("\n");

export const inlineInvalidWithoutTypeArgumentsCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const noTypeArgumentsCheck: IsEqual = true;",
    "",
    "Boolean(noTypeArgumentsCheck);",
].join("\n");

export const inlineInvalidSingleTypeArgumentCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const oneTypeArgumentCheck: IsEqual<string> = true;",
    "",
    "Boolean(oneTypeArgumentCheck);",
].join("\n");

export const inlineInvalidThreeTypeArgumentsCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const threeTypeArgumentsCheck: IsEqual<string, string, boolean> = true;",
    "",
    "Boolean(threeTypeArgumentsCheck);",
].join("\n");

export const inlineInvalidWithConflictingIsEqualTypeBindingCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const isEqualType = (left: unknown, right: unknown): boolean => left === right;",
    "const conflictingBindingCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(conflictingBindingCheck);",
].join("\n");

export const inlineValidUnionBooleanTypeCode: string = [
    'import type { IsEqual } from "type-fest";',
    "",
    "const unionFlag: false | true = true;",
    "",
    "Boolean(unionFlag);",
].join("\n");

export const inlineValidNamespaceBooleanNonIsEqualCode: string = [
    'import type * as TypeFest from "type-fest";',
    "",
    "const namespaceBoolean: TypeFest.Promisable<boolean> = true;",
    "",
    "Boolean(namespaceBoolean);",
].join("\n");

export const inlineValidNamedImportBooleanNonIsEqualCode: string = [
    'import type { Promisable } from "type-fest";',
    "",
    "const namedImportBoolean: Promisable<boolean> = true;",
    "",
    "Boolean(namedImportBoolean);",
].join("\n");

export const inlineValidNonTypeFestIsEqualImportCode: string = [
    'import type { IsEqual } from "ts-extras";',
    "",
    "const externalEqualCheck: IsEqual<string, string> = true;",
    "",
    "Boolean(externalEqualCheck);",
].join("\n");

export const inlineValidLocalNamespaceIsEqualCode: string = [
    "declare namespace LocalTypes {",
    "    type IsEqual<Left, Right> = boolean;",
    "}",
    "",
    "const localNamespaceCheck: LocalTypes.IsEqual<string, string> = true;",
    "",
    "Boolean(localNamespaceCheck);",
].join("\n");

export const disableAllAutofixesSettings: Readonly<{
    typefest: {
        disableAllAutofixes: boolean;
    };
}> = {
    typefest: {
        disableAllAutofixes: true,
    },
};
