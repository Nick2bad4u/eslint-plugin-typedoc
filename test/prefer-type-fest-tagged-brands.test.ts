import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    fastCheckRunConfig,
    isSafeGeneratedIdentifier,
} from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-tagged-brands.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const defaultOptions = [
    {
        enforceAdHocBrandIntersections: true,
        enforceLegacyAliases: true,
    },
] as const;
const legacyAliasesOnlyOptions = [
    {
        enforceAdHocBrandIntersections: false,
        enforceLegacyAliases: true,
    },
] as const;
const adHocIntersectionsOnlyOptions = [
    {
        enforceAdHocBrandIntersections: true,
        enforceLegacyAliases: false,
    },
] as const;

const validFixtureName = "prefer-type-fest-tagged-brands.valid.ts";
const invalidFixtureName = "prefer-type-fest-tagged-brands.invalid.ts";
const importedAliasFixtureName =
    "prefer-type-fest-tagged-brands-imported-alias.invalid.ts";
const importedAliasFixtureCode = readTypedFixture(importedAliasFixtureName);
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
            `Expected prefer-type-fest-tagged-brands fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const importedAliasFixtureOutputCode = replaceOrThrow({
    replacement:
        'from "ts-essentials";\nimport type { Tagged } from "type-fest";\r\n',
    sourceText: importedAliasFixtureCode,
    target: 'from "ts-essentials";\r\n',
});

const importedAliasFixtureFirstPassOutputCode = replaceOrThrow({
    replacement: "Tagged<",
    sourceText: importedAliasFixtureOutputCode,
    target: "Opaque<",
});
const importedAliasFixtureSecondPassOutputCode = replaceOrThrow({
    replacement: "Tagged<",
    sourceText: importedAliasFixtureFirstPassOutputCode,
    target: "Branded<",
});
const inlineFixableInvalidCode = [
    'import type { Opaque } from "type-aliases";',
    'import type { Tagged } from "type-fest";',
    "",
    'type UserId = Opaque<string, "UserId">;',
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: 'type UserId = Tagged<string, "UserId">;',
    sourceText: inlineFixableInvalidCode,
    target: 'type UserId = Opaque<string, "UserId">;',
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { Opaque } from "type-aliases";',
    "",
    'type Wrapper<Tagged> = Opaque<string, "UserId">;',
].join("\n");
const inlineInvalidMixedTypeLiteralMembersCode = [
    "type SessionIdentifier = string & {",
    '    readonly __brand: "SessionIdentifier";',
    "    (): void;",
    "};",
].join("\n");
const inlineInvalidTagPropertyIntersectionCode = [
    "type SessionIdentifier = string & {",
    '    readonly __tag: "SessionIdentifier";',
    "};",
].join("\n");
const inlineInvalidBrandPropertyIntersectionCode = [
    "type SessionIdentifier = string & {",
    '    readonly brand: "SessionIdentifier";',
    "};",
].join("\n");
const inlineInvalidReferencedAliasIntersectionCode = [
    "type SessionIdentifierToken = string;",
    "",
    "type SessionIdentifier = SessionIdentifierToken & {",
    '    readonly __brand: "SessionIdentifier";',
    "};",
].join("\n");
const inlineValidNamespaceTaggedReferenceCode = [
    'import type * as TypeFest from "type-fest";',
    "",
    'type UserId = TypeFest.Tagged<string, "UserId">;',
].join("\n");
const inlineValidMethodSignatureBrandLikeCode = [
    "type SessionIdentifier = string & {",
    "    __brand(): void;",
    "};",
].join("\n");
const inlineValidNonBrandPropertyIntersectionCode = [
    "type SessionIdentifier = string & {",
    '    readonly label: "SessionIdentifier";',
    "};",
].join("\n");
const inlineValidTaggedAndBrandIntersectionCode = [
    'import type { Tagged } from "type-fest";',
    "",
    'type SessionIdentifier = Tagged<string, "SessionIdentifier"> & {',
    '    readonly __brand: "SessionIdentifier";',
    "};",
].join("\n");
const inlineValidNestedTaggedReferenceCode = [
    'import type { Tagged } from "type-fest";',
    "",
    "type SessionIdentifier = (",
    '    | Tagged<string, "SessionIdentifier">',
    "    | number",
    ") & {",
    '    readonly __brand: "SessionIdentifier";',
    "};",
].join("\n");

type TaggedBrandsAlias = "Branded" | "Opaque";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const taggedBrandsAliasArbitrary = fc.constantFrom<TaggedBrandsAlias>(
    "Opaque",
    "Branded"
);

const uppercaseIdentifierCharacters = Array.from({ length: 26 }, (_, index) =>
    String.fromCodePoint(65 + index)
);
const lowercaseIdentifierCharacters = Array.from({ length: 26 }, (_, index) =>
    String.fromCodePoint(97 + index)
);
const numericIdentifierCharacters = Array.from({ length: 10 }, (_, index) =>
    String(index)
);
const identifierHeadCharacters = [
    ...uppercaseIdentifierCharacters,
    ...lowercaseIdentifierCharacters,
    "_",
];
const identifierTailCharacters = [
    ...identifierHeadCharacters,
    ...numericIdentifierCharacters,
];
const identifierHeadArbitrary = fc
    .integer({
        max: identifierHeadCharacters.length - 1,
        min: 0,
    })
    .map((index) => identifierHeadCharacters[index] ?? "_");
const identifierTailArbitrary = fc
    .array(
        fc
            .integer({
                max: identifierTailCharacters.length - 1,
                min: 0,
            })
            .map((index) => identifierTailCharacters[index] ?? "_"),
        {
            maxLength: 8,
        }
    )
    .map((characters) => characters.join(""));
// eslint-disable-next-line total-functions/no-hidden-type-assertions -- Fast-check generic inference is intentional for this local arbitrary composition.
const generatedIdentifierArbitrary = fc
    .record({
        head: identifierHeadArbitrary,
        tail: identifierTailArbitrary,
    })
    .map(({ head, tail }) => `${head}${tail}`)
    .filter((candidate) => isSafeGeneratedIdentifier(candidate));

const parseTaggedTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    taggedReference: TSESTree.TSTypeReference;
}> => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference &&
            statement.typeAnnotation.typeName.type === AST_NODE_TYPES.Identifier
        ) {
            return {
                ast: parsed.ast,
                taggedReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a tagged brand type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-tagged-brands", {
    defaultOptions,
    docsDescription:
        "require TypeFest Tagged over ad-hoc intersection branding with __brand/__tag fields.",
    messages: {
        preferTaggedAlias:
            "Prefer `{{replacement}}` from type-fest for canonical tagged-brand aliases instead of legacy alias `{{alias}}`.",
        preferTaggedBrand:
            "Type alias '{{alias}}' uses ad-hoc branding. Prefer `Tagged` from type-fest for branded primitive identifiers.",
    },
});

describe("prefer-type-fest-tagged-brands parse-safety guards", () => {
    it("fast-check: Tagged replacement remains parseable for imported alias references", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                taggedBrandsAliasArbitrary,
                generatedIdentifierArbitrary,
                generatedIdentifierArbitrary,
                fc.boolean(),
                (
                    legacyAlias,
                    valueIdentifier,
                    tagIdentifier,
                    includeUnicodeLine
                ) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        `import type { ${legacyAlias} } from "ts-essentials";`,
                        'import type { Tagged } from "type-fest";',
                        `type UserId = ${legacyAlias}<${valueIdentifier}, "${tagIdentifier}">;`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "Tagged<",
                        sourceText: generatedCode,
                        target: `${legacyAlias}<`,
                    });

                    const { taggedReference } =
                        parseTaggedTypeReferenceFromCode(replacedCode);

                    expect(taggedReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        taggedReference.typeName.type ===
                        AST_NODE_TYPES.Identifier
                    ) {
                        expect(taggedReference.typeName.name).toBe("Tagged");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-tagged-brands",
    getPluginRule("prefer-type-fest-tagged-brands"),
    {
        invalid: [
            {
                code: readTypedFixture(invalidFixtureName),
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture ad-hoc brand intersections",
            },
            {
                code: importedAliasFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                    {
                        data: {
                            alias: "Branded",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
                name: "reports imported opaque and branded aliases",
                output: [
                    importedAliasFixtureFirstPassOutputCode,
                    importedAliasFixtureSecondPassOutputCode,
                ],
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
                name: "reports and autofixes imported Opaque alias",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
                name: "reports imported Opaque alias when replacement identifier is shadowed",
                output: null,
            },
            {
                code: inlineInvalidMixedTypeLiteralMembersCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports mixed type-literal members in brand intersection",
            },
            {
                code: inlineInvalidTagPropertyIntersectionCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports intersections branded with __tag property",
            },
            {
                code: inlineInvalidBrandPropertyIntersectionCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports intersections branded with brand property",
            },
            {
                code: inlineInvalidReferencedAliasIntersectionCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports ad-hoc branding when intersection uses non-Tagged type references",
            },
            {
                code: importedAliasFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "Opaque",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                    {
                        data: {
                            alias: "Branded",
                            replacement: "Tagged",
                        },
                        messageId: "preferTaggedAlias",
                    },
                ],
                filename: typedFixturePath(importedAliasFixtureName),
                name: "reports imported aliases when only legacy alias enforcement is enabled",
                options: legacyAliasesOnlyOptions,
                output: [
                    importedAliasFixtureFirstPassOutputCode,
                    importedAliasFixtureSecondPassOutputCode,
                ],
            },
            {
                code: inlineInvalidBrandPropertyIntersectionCode,
                errors: [{ messageId: "preferTaggedBrand" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports ad-hoc branding when only intersection enforcement is enabled",
                options: adHocIntersectionsOnlyOptions,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: inlineValidNamespaceTaggedReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores namespace-qualified Tagged usage",
            },
            {
                code: inlineValidMethodSignatureBrandLikeCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores method-signature-only brand-like type",
            },
            {
                code: inlineValidNonBrandPropertyIntersectionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores intersection property that is not a branding key",
            },
            {
                code: inlineValidTaggedAndBrandIntersectionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores ad-hoc brand literal when Tagged already exists",
            },
            {
                code: inlineValidNestedTaggedReferenceCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores nested Tagged references inside union and intersection",
            },
            {
                code: inlineInvalidTagPropertyIntersectionCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores ad-hoc intersections when enforceAdHocBrandIntersections is disabled",
                options: legacyAliasesOnlyOptions,
            },
            {
                code: importedAliasFixtureCode,
                filename: typedFixturePath(importedAliasFixtureName),
                name: "ignores legacy aliases when enforceLegacyAliases is disabled",
                options: adHocIntersectionsOnlyOptions,
            },
        ],
    }
);
