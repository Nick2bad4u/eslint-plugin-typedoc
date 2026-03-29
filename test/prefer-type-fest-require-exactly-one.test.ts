import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-require-exactly-one.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-require-exactly-one.valid.ts";
const namespaceValidFixtureName =
    "prefer-type-fest-require-exactly-one.namespace.valid.ts";
const invalidFixtureName = "prefer-type-fest-require-exactly-one.invalid.ts";
const defaultOptions = [
    {
        enforcedAliasNames: ["OneOf", "RequireOnlyOne"],
    },
] as const;
const requireOnlyOneOnlyOptions = [
    {
        enforcedAliasNames: ["RequireOnlyOne"],
    },
] as const;
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
            `Expected prefer-type-fest-require-exactly-one fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = replaceOrThrow({
    replacement:
        'from "type-aliases";\nimport type { RequireExactlyOne } from "type-fest";\r\n',
    sourceText: invalidFixtureCode,
    target: 'from "type-aliases";\r\n',
});
const fixtureFixableFirstPassOutputCode = replaceOrThrow({
    replacement: "RequireExactlyOne<",
    sourceText: fixtureFixableOutputCode,
    target: "OneOf<",
});
const fixtureFixableSecondPassOutputCode = replaceOrThrow({
    replacement: "RequireExactlyOne<",
    sourceText: fixtureFixableFirstPassOutputCode,
    target: "RequireOnlyOne<",
});
const inlineFixableInvalidCode = [
    'import type { OneOf } from "type-aliases";',
    'import type { RequireExactlyOne } from "type-fest";',
    "",
    "type Input = OneOf<{ a?: string; b?: number }>;",
].join("\n");
const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type Input = RequireExactlyOne<{ a?: string; b?: number }>;",
    sourceText: inlineFixableInvalidCode,
    target: "type Input = OneOf<{ a?: string; b?: number }>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { OneOf } from "type-aliases";',
    "",
    "type Wrapper<RequireExactlyOne> = OneOf<{ a?: string; b?: number }>;",
].join("\n");
const requireOnlyOneOnlyInvalidCode = [
    'import type { RequireOnlyOne } from "type-aliases";',
    'import type { RequireExactlyOne } from "type-fest";',
    "",
    "type Input = RequireOnlyOne<{ a?: string; b?: number }>;",
].join("\n");
const requireOnlyOneOnlyOutputCode = [
    'import type { RequireOnlyOne } from "type-aliases";',
    'import type { RequireExactlyOne } from "type-fest";',
    "",
    "type Input = RequireExactlyOne<{ a?: string; b?: number }>;",
].join("\n");
const oneOfIgnoredByOptionsValidCode = [
    'import type { OneOf } from "type-aliases";',
    "",
    "type Input = OneOf<{ a?: string; b?: number }>;",
].join("\n");

type RequireExactlyOneLegacyAlias = "OneOf" | "RequireOnlyOne";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const requireExactlyOneLegacyAliasArbitrary =
    fc.constantFrom<RequireExactlyOneLegacyAlias>("OneOf", "RequireOnlyOne");
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

const parseRequireExactlyOneTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a RequireExactlyOne type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-require-exactly-one", {
    defaultOptions,
    docsDescription:
        "require TypeFest RequireExactlyOne over imported aliases such as OneOf/RequireOnlyOne.",
    messages: {
        preferRequireExactlyOne:
            "Prefer `{{replacement}}` from type-fest to require exactly one key from a group instead of legacy alias `{{alias}}`.",
    },
    name: "prefer-type-fest-require-exactly-one",
});

describe("prefer-type-fest-require-exactly-one parse-safety guards", () => {
    it("fast-check: RequireExactlyOne replacement remains parseable across alias variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                requireExactlyOneLegacyAliasArbitrary,
                keyNamePairArbitrary,
                fc.boolean(),
                (legacyAlias, keyPair, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedTypeReference = `${legacyAlias}<{ ${keyPair.firstKey}?: string; ${keyPair.secondKey}?: number }>`;
                    const generatedCode = [
                        unicodeLine,
                        `import type { ${legacyAlias} } from "type-aliases";`,
                        'import type { RequireExactlyOne } from "type-fest";',
                        `type Input = ${generatedTypeReference};`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "RequireExactlyOne<{",
                        sourceText: generatedCode,
                        target: `${legacyAlias}<{`,
                    });

                    const { tsReference } =
                        parseRequireExactlyOneTypeReferenceFromCode(
                            replacedCode
                        );

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe(
                            "RequireExactlyOne"
                        );
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-require-exactly-one",
    getPluginRule("prefer-type-fest-require-exactly-one"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [
                    {
                        data: {
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                    {
                        data: {
                            alias: "RequireOnlyOne",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture OneOf and RequireOnlyOne alias usage",
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
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline OneOf alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "OneOf",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports OneOf alias when replacement identifier is shadowed",
                output: null,
            },
            {
                code: requireOnlyOneOnlyInvalidCode,
                errors: [
                    {
                        data: {
                            alias: "RequireOnlyOne",
                            replacement: "RequireExactlyOne",
                        },
                        messageId: "preferRequireExactlyOne",
                    },
                ],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports only configured aliases via enforcedAliasNames option",
                options: requireOnlyOneOnlyOptions,
                output: requireOnlyOneOnlyOutputCode,
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
                name: "accepts namespace-qualified RequireExactlyOne references",
            },
            {
                code: oneOfIgnoredByOptionsValidCode,
                filename: typedFixturePath(validFixtureName),
                name: "ignores aliases that are excluded by enforcedAliasNames option",
                options: requireOnlyOneOnlyOptions,
            },
        ],
    }
);
