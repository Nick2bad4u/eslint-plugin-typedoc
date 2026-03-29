import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-partial-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-partial-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-partial-deep.invalid.ts";
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
            `Expected prefer-type-fest-partial-deep fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { PartialDeep } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "PartialDeep<TeamConfig>",
        sourceText: invalidFixtureCode,
        target: "DeepPartial<TeamConfig>",
    }
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepPartial } from "type-aliases";',
    'import type { PartialDeep } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type PartialUser = DeepPartial<User>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type PartialUser = PartialDeep<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type PartialUser = DeepPartial<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { DeepPartial } from "type-aliases";',
    "",
    "type Wrapper<PartialDeep extends object> = DeepPartial<PartialDeep>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const partialDeepSubjectArbitrary = fc.constantFrom<
    "nestedObject" | "readonlyArray" | "singleProperty"
>("singleProperty", "nestedObject", "readonlyArray");

const buildPartialDeepSubjectType = (
    subjectKind: "nestedObject" | "readonlyArray" | "singleProperty"
): string => {
    if (subjectKind === "singleProperty") {
        return "{ id: string }";
    }

    if (subjectKind === "nestedObject") {
        return "{ profile: { email: string; phone: string } }";
    }

    return "{ members: readonly { id: string }[] }";
};

const parsePartialDeepTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a PartialDeep type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-partial-deep", {
    defaultOptions: [],
    docsDescription: "require TypeFest PartialDeep over `DeepPartial` aliases.",
    enforceRuleShape: true,
    messages: {
        preferPartialDeep:
            "Prefer `PartialDeep` from type-fest over `DeepPartial`.",
    },
    name: "prefer-type-fest-partial-deep",
});

describe("prefer-type-fest-partial-deep parse-safety guards", () => {
    it("fast-check: PartialDeep replacement remains parseable across deep-structure variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                partialDeepSubjectArbitrary,
                includeUnicodeBannerArbitrary,
                (subjectKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const subjectType =
                        buildPartialDeepSubjectType(subjectKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import type { DeepPartial } from "type-aliases";',
                        'import type { PartialDeep } from "type-fest";',
                        `type Subject = ${subjectType};`,
                        "type PartialSubject = DeepPartial<Subject>;",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "PartialDeep<",
                        sourceText: generatedCode,
                        target: "DeepPartial<",
                    });

                    const { tsReference } =
                        parsePartialDeepTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("PartialDeep");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(
    "prefer-type-fest-partial-deep",
    getPluginRule("prefer-type-fest-partial-deep"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepPartial alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepPartial alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [{ messageId: "preferPartialDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports DeepPartial alias when replacement identifier is shadowed",
                output: null,
            },
        ],
        valid: [
            {
                code: readTypedFixture(validFixtureName),
                filename: typedFixturePath(validFixtureName),
                name: "accepts fixture-safe patterns",
            },
        ],
    }
);
