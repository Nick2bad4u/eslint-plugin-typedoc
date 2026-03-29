import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-all-or-none.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-all-or-none.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-all-or-none.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-all-or-none.invalid.ts";
const invalidFixtureCode = readTypedFixture(invalidFixtureName);
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
            `Expected prefer-type-fest-require-all-or-none fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'from "type-aliases";\nimport type { RequireAllOrNone } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'from "type-aliases";\r\n',
});
const fixtureFixableFirstPassOutputCode = replaceOrThrow({
    replacement: "RequireAllOrNone<",
    sourceText: fixtureFixableOutputCode,
    target: "AllOrNone<",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "RequireAllOrNone<",
    sourceText: fixtureFixableFirstPassOutputCode,
    target: "AllOrNothing<",
});
const inlineFixableInvalidCode = [
    'import type { AllOrNone } from "type-aliases";',
    'import type { RequireAllOrNone } from "type-fest";',
    "",
    "type Input = AllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement:
        "type Input = RequireAllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = AllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { AllOrNone } from "type-aliases";',
    "",
    "type Wrapper<RequireAllOrNone> = AllOrNone<{ a?: string; b?: number }, 'a' | 'b'>;",
].join("\n");

type RequireAllOrNoneLegacyAlias = "AllOrNone" | "AllOrNothing";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const requireAllOrNoneLegacyAliasArbitrary =
    fc.constantFrom<RequireAllOrNoneLegacyAlias>("AllOrNone", "AllOrNothing");
const keyNamePairArbitrary = fc
    .shuffledSubarray(
        [
            "alpha",
            "beta",
            "firstName",
            "lastName",
            "userId",
            "tenantId",
        ],
        {
            maxLength: 2,
            minLength: 2,
        }
    )
    .map(([firstKey, secondKey]) => ({
        firstKey,
        secondKey,
    }));

const parseRequireAllOrNoneTypeReferenceFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    tsReference: TSESTree.TSTypeReference;
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
                tsReference: statement.typeAnnotation,
            };
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from a RequireAllOrNone type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-require-all-or-none", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest RequireAllOrNone over imported aliases such as AllOrNone/AllOrNothing.",
    enforceRuleShape: true,
    messages: {
        preferRequireAllOrNone:
            "Prefer `{{replacement}}` from type-fest to require all-or-none key groups instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-require-all-or-none",
});

describe("prefer-type-fest-require-all-or-none parse-safety guards", () => {
    it("fast-check: RequireAllOrNone replacement remains parseable across alias variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                requireAllOrNoneLegacyAliasArbitrary,
                keyNamePairArbitrary,
                fc.boolean(),
                (legacyAlias, keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `${legacyAlias}<{ ${keyPair.firstKey}?: string; ${keyPair.secondKey}?: number }, '${keyPair.firstKey}' | '${keyPair.secondKey}'>`;
                    const generatedCode = [
                        unicodeLine,
                        `import type { ${legacyAlias} } from "type-aliases";`,
                        'import type { RequireAllOrNone } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "RequireAllOrNone<{",
                        sourceText: generatedCode,
                        target: `${legacyAlias}<{`,
                    });

                    const { tsReference } =
                        parseRequireAllOrNoneTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "RequireAllOrNone"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-require-all-or-none",
    getPluginRule("prefer-type-fest-require-all-or-none"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                    {
                        data: {
                            alias: "AllOrNothing",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture AllOrNone and AllOrNothing alias usage",
                output: [
                    fixtureFixableFirstPassOutputCode,
                    fixtureFixableSecondPassOutputCode,
                ],
            },
            {
                code: inlineFixableInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline AllOrNone alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "AllOrNone",
                            replacement: "RequireAllOrNone",
                        },
                        messageId: "preferRequireAllOrNone",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports AllOrNone alias when replacement identifier is shadowed",
                output: null,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
            {
                code: readTypedFixture(namespaceValidFixtureName),
                filename: typedFixturePath(namespaceValidFixtureName),
                name: "accepts namespace-qualified RequireAllOrNone references",
            },
        ],
    }
);
