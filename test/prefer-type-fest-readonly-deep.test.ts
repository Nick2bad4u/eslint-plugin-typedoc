import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-readonly-deep.test` behavior.
 */
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createTypedRuleTester();
const ruleId = "prefer-type-fest-readonly-deep";
const docsDescription =
    "require TypeFest ReadonlyDeep over `DeepReadonly` aliases.";
const preferReadonlyDeepMessage =
    "Prefer `ReadonlyDeep` from type-fest over `DeepReadonly`.";

const validFixtureName = "prefer-type-fest-readonly-deep.valid.ts";
const invalidFixtureName = "prefer-type-fest-readonly-deep.invalid.ts";
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
            `Expected prefer-type-fest-readonly-deep fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { ReadonlyDeep } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "ReadonlyDeep<TeamConfig>",
        sourceText: invalidFixtureCode,
        target: "DeepReadonly<TeamConfig>",
    }
)}`;
const inlineFixableInvalidCode = [
    'import type { DeepReadonly } from "type-aliases";',
    'import type { ReadonlyDeep } from "type-fest";',
    "",
    "type User = {",
    "    id: string;",
    "};",
    "",
    "type FrozenUser = DeepReadonly<User>;",
].join("\n");

const inlineFixableOutputCode = replaceOrThrow({
    replacement: "type FrozenUser = ReadonlyDeep<User>;",
    sourceText: inlineFixableInvalidCode,
    target: "type FrozenUser = DeepReadonly<User>;",
});
const inlineNoFixShadowedReplacementInvalidCode = [
    'import type { DeepReadonly } from "type-aliases";',
    "",
    "type Wrapper<ReadonlyDeep extends object> = DeepReadonly<ReadonlyDeep>;",
].join("\n");

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const includeUnicodeBannerArbitrary = fc.boolean();
const readonlyDeepSubjectArbitrary = fc.constantFrom<
    "nestedObject" | "readonlyArray" | "singleProperty"
>("singleProperty", "nestedObject", "readonlyArray");

const buildReadonlyDeepSubjectType = (
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

const parseReadonlyDeepTypeReferenceFromCode = (
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
        "Expected generated source text to include a type alias assigned from a ReadonlyDeep type reference"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferReadonlyDeep: preferReadonlyDeepMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-readonly-deep parse-safety guards", () => {
    it("fast-check: ReadonlyDeep replacement remains parseable across deep-structure variants", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                readonlyDeepSubjectArbitrary,
                includeUnicodeBannerArbitrary,
                (subjectKind, includeUnicodeBanner) => {
                    const unicodeBanner = includeUnicodeBanner
                        ? 'const unicodeBanner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const subjectType =
                        buildReadonlyDeepSubjectType(subjectKind);
                    const generatedCode = [
                        unicodeBanner,
                        'import type { DeepReadonly } from "type-aliases";',
                        'import type { ReadonlyDeep } from "type-fest";',
                        `type Subject = ${subjectType};`,
                        "type FrozenSubject = DeepReadonly<Subject>;",
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "ReadonlyDeep<",
                        sourceText: generatedCode,
                        target: "DeepReadonly<",
                    });

                    const { tsReference } =
                        parseReadonlyDeepTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("ReadonlyDeep");
                    }
                }
            ),
            fastCheckRunConfig.default
        );
    });
});

ruleTester.run(ruleId, getPluginRule(ruleId), {
    invalid: [
        {
            code: invalidFixtureCode,
            errors: [{ messageId: "preferReadonlyDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture DeepReadonly alias usage",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineFixableInvalidCode,
            errors: [{ messageId: "preferReadonlyDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports and autofixes inline DeepReadonly alias import",
            output: inlineFixableOutputCode,
        },
        {
            code: inlineNoFixShadowedReplacementInvalidCode,
            errors: [{ messageId: "preferReadonlyDeep" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports DeepReadonly alias when replacement identifier is shadowed",
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
});
