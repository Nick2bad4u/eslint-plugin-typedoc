import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-required-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();

const validFixtureName = "prefer-type-fest-required-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-required-deep.invalid.ts";
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
            `Expected prefer-type-fest-required-deep fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { RequiredDeep } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "RequiredDeep<TeamConfig>",
        sourceText: invalidFixtureCode,
        target: "DeepRequired<TeamConfig>",
    }
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepRequired } from "type-aliases";',
    'import type { RequiredDeep } from "type-fest";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    "type StrictUser = DeepRequired<User>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type StrictUser = RequiredDeep<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type StrictUser = DeepRequired<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { DeepRequired } from "type-aliases";',
    "",
    "type User = {",
    "    id?: string;",
    "};",
    "",
    "type Wrapper<RequiredDeep> = DeepRequired<User>;",
].join("\n");
const fixtureSafePatternsValidCase = {
    code: readTypedFixture(validFixtureName),
    filename: typedFixturePath(validFixtureName),
    name: "accepts fixture-safe patterns",
} as const;

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const requiredDeepSubjectArbitrary = fc.constantFrom<
    "nestedObject" | "readonlyArray" | "singleProperty"
>("singleProperty", "nestedObject", "readonlyArray");

const buildRequiredDeepSubjectType = (
    subjectKind: "nestedObject" | "readonlyArray" | "singleProperty"
): string => {
    if (subjectKind === "singleProperty") {
        return "{ id?: string }";
    }

    if (subjectKind === "nestedObject") {
        return "{ profile?: { email?: string; phone?: string } }";
    }

    return "{ members?: readonly { id?: string }[] }";
};

const parseRequiredDeepTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a RequiredDeep type reference"
    );
};

addTypeFestRuleMetadataSmokeTests("prefer-type-fest-required-deep", {
    defaultOptions: [],
    docsDescription:
        "require TypeFest RequiredDeep over `DeepRequired` aliases.",
    enforceRuleShape: true,
    messages: {
        preferRequiredDeep:
            "Prefer `RequiredDeep` from type-fest over `DeepRequired`.",
    },
    name: "prefer-type-fest-required-deep",
});

describe("prefer-type-fest-required-deep parse-safety guards", () => {
    it("fast-check: RequiredDeep replacement remains parseable across deep-structure variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                requiredDeepSubjectArbitrary,
                includeUnicodeBannerArbitrary,
                (subjectKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const subjectType =
                        buildRequiredDeepSubjectType(subjectKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import type { DeepRequired } from "type-aliases";',
                        'import type { RequiredDeep } from "type-fest";',
                        `type Subject = ${subjectType};`,
                        "type StrictSubject = DeepRequired<Subject>;",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "RequiredDeep<",
                        sourceText: generatedCode,
                        target: "DeepRequired<",
                    });

                    const { tsReference } =
                        parseRequiredDeepTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("RequiredDeep");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

describe(
    "prefer-type-fest-required-deep RuleTester fixture validity",
    {
        timeout: 120_000,
    },
    () => {
        ruleTester.run(
            "prefer-type-fest-required-deep fixture validity",
            getPluginRule("prefer-type-fest-required-deep"),
            {
                invalid: [],
                valid: [fixtureSafePatternsValidCase],
            }
        );
    }
);

ruleTester.run(
    "prefer-type-fest-required-deep",
    getPluginRule("prefer-type-fest-required-deep"),
    {
        invalid: [
            {
                code: invalidFixtureCode,
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports fixture DeepRequired alias usage",
                output: fixtureFixableOutputCode,
            },
            {
                code: inlineFixableInvalidCode,
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports and autofixes inline DeepRequired alias import",
                output: inlineFixableOutputCode,
            },
            {
                code: inlineNoFixShadowedReplacementInvalidCode,
                errors: [{ messageId: "preferRequiredDeep" }],
                filename: typedFixturePath(invalidFixtureName),
                name: "reports DeepRequired alias when replacement identifier is shadowed",
                output: null,
            },
        ],
        valid: [],
    }
);
