import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { fastCheckRunConfig } from "./_internal/fast-check";
import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
/**
 * @packageDocumentation
 * Vitest coverage for `prefer-type-fest-unknown-record.test` behavior.
 */
import { createRuleTester, getPluginRule } from "./_internal/ruleTester";
import {
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

const ruleTester = createRuleTester();
const ruleId = "prefer-type-fest-unknown-record";
const docsDescription =
    "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.";
const preferUnknownRecordMessage =
    "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.";

const invalidFixtureName = "prefer-type-fest-unknown-record.invalid.ts";
const validFixtureName = "prefer-type-fest-unknown-record.valid.ts";
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
            `Expected prefer-type-fest-unknown-record fixture text to contain replaceable segment: ${target}`
        );
    }

    return replacedText;
};

const fixtureFixableOutputCode = `import type { UnknownRecord } from "type-fest";\n${replaceOrThrow(
    {
        replacement: "UnknownRecord",
        sourceText: invalidFixtureCode,
        target: "Record<string, unknown>",
    }
)}`;
const inlineValidGlobalRecordCode =
    "type SharedContext = globalThis.Record<string, unknown>;";
const inlineValidNonUnknownValueCode =
    "type SharedContext = Record<string, string>;";
const inlineValidNonStringKeyCode =
    "type SharedContext = Record<number, unknown>;";
const inlineValidNonRecordIdentifierCode = [
    "type Box<KeyType, ValueType> = {",
    "    key: KeyType;",
    "    value: ValueType;",
    "};",
    "type SharedContext = Box<string, unknown>;",
].join("\n");
const inlineInvalidRecordStringUnknownCode =
    "type SharedContext = Record<string, unknown>;";
const inlineInvalidRecordStringUnknownOutput = [
    'import type { UnknownRecord } from "type-fest";',
    "type SharedContext = UnknownRecord;",
].join("\n");
const inlineFixableCode = [
    'import type { UnknownRecord } from "type-fest";',
    "",
    "type SharedContext = Record<string, unknown>;",
].join("\n");
const inlineFixableOutput = [
    'import type { UnknownRecord } from "type-fest";',
    "",
    "type SharedContext = UnknownRecord;",
].join("\n");
const inlineNoFixShadowedReplacementCode =
    "type Wrapper<UnknownRecord> = Record<string, unknown>;";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

const generatedIdentifierArbitrary = fc.constantFrom(
    "alpha",
    "beta",
    "tenant",
    "scope",
    "featureFlag"
);

const parseUnknownRecordTypeReferenceFromCode = (sourceText: string) => {
    const parsed = parser.parseForESLint(sourceText, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
            statement.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference
        ) {
            return statement.typeAnnotation;
        }
    }

    throw new Error(
        "Expected generated source text to include a type alias assigned from UnknownRecord"
    );
};

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    enforceRuleShape: true,
    messages: {
        preferUnknownRecord: preferUnknownRecordMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-unknown-record parse-safety guards", () => {
    it("fast-check: UnknownRecord replacement remains parseable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                generatedIdentifierArbitrary,
                fc.boolean(),
                (keyName, includeUnicodeLine) => {
                    const unicodeLine = includeUnicodeLine
                        ? 'const note = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
                        : "";
                    const generatedCode = [
                        unicodeLine,
                        'import type { UnknownRecord } from "type-fest";',
                        `type SharedContext = Record<string, unknown>;`,
                        `type _Key = "${keyName}";`,
                    ]
                        .filter((line) => line.length > 0)
                        .join("\n");

                    const replacedCode = replaceOrThrow({
                        replacement: "UnknownRecord",
                        sourceText: generatedCode,
                        target: "Record<string, unknown>",
                    });

                    const tsReference =
                        parseUnknownRecordTypeReferenceFromCode(replacedCode);

                    expect(tsReference.typeName.type).toBe(
                        AST_NODE_TYPES.Identifier
                    );

                    if (
                        tsReference.typeName.type === AST_NODE_TYPES.Identifier
                    ) {
                        expect(tsReference.typeName.name).toBe("UnknownRecord");
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
            errors: [{ messageId: "preferUnknownRecord" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports fixture unknown record aliases",
            output: fixtureFixableOutputCode,
        },
        {
            code: inlineInvalidRecordStringUnknownCode,
            errors: [{ messageId: "preferUnknownRecord" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports inline Record<string, unknown> alias",
            output: inlineInvalidRecordStringUnknownOutput,
        },
        {
            code: inlineFixableCode,
            errors: [{ messageId: "preferUnknownRecord" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "autofixes Record<string, unknown> when UnknownRecord import is in scope",
            output: inlineFixableOutput,
        },
        {
            code: inlineNoFixShadowedReplacementCode,
            errors: [{ messageId: "preferUnknownRecord" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports Record<string, unknown> when replacement identifier is shadowed",
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
            code: inlineValidGlobalRecordCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores globalThis.Record<string, unknown>",
        },
        {
            code: inlineValidNonUnknownValueCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-unknown value type",
        },
        {
            code: inlineValidNonStringKeyCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores Record with non-string key type",
        },
        {
            code: inlineValidNonRecordIdentifierCode,
            filename: typedFixturePath(validFixtureName),
            name: "ignores non-Record generic with string unknown type arguments",
        },
    ],
});
