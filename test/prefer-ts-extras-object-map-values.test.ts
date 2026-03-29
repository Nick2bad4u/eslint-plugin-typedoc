import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import {
    createTypedRuleTester,
    readTypedFixture,
    typedFixturePath,
} from "./_internal/typed-rule-tester";

/**
 * @packageDocumentation
 * Vitest coverage for `prefer-ts-extras-object-map-values` behavior.
 */
const ruleId = "prefer-ts-extras-object-map-values";
const docsDescription =
    "require ts-extras objectMapValues over objectFromEntries(objectEntries(...).map(...)) chains that only remap values.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-map-values";
const preferTsExtrasObjectMapValuesMessage =
    "Prefer `objectMapValues` from `ts-extras` over `objectFromEntries(objectEntries(...).map(...))` when the map callback preserves keys and only remaps values.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

const validFixtureName = "prefer-ts-extras-object-map-values.valid.ts";
const invalidFixtureName = "prefer-ts-extras-object-map-values.invalid.ts";

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferTsExtrasObjectMapValues: preferTsExtrasObjectMapValuesMessage,
    },
    name: ruleId,
});

describe("prefer-ts-extras-object-map-values metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: readTypedFixture(invalidFixtureName),
            errors: [
                { messageId: "preferTsExtrasObjectMapValues" },
                { messageId: "preferTsExtrasObjectMapValues" },
                { messageId: "preferTsExtrasObjectMapValues" },
            ],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports key-preserving ts-extras object remapping chains from fixture",
        },
        {
            code: [
                'import { objectEntries as entries, objectFromEntries as fromEntries } from "ts-extras";',
                "",
                'const statusById = { alpha: "up", beta: "down" } as const;',
                "",
                "const mapped = fromEntries(",
                '    entries(statusById).map(([key, value]) => [key, key + ":" + value])',
                ");",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasObjectMapValues" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports alias-imported objectEntries/objectFromEntries chains",
        },
        {
            code: [
                'import { objectEntries, objectFromEntries } from "ts-extras";',
                "",
                'const statusById = { alpha: "up", beta: "down" } as const;',
                "",
                "const mapped = objectFromEntries(",
                "    objectEntries(statusById).map(([key, value]) => {",
                '        return [key, key + ":" + value] as const;',
                "    })",
                ");",
            ].join("\n"),
            errors: [{ messageId: "preferTsExtrasObjectMapValues" }],
            filename: typedFixturePath(invalidFixtureName),
            name: "reports block-return callbacks that preserve keys and only remap values",
        },
    ],
    valid: [
        {
            code: readTypedFixture(validFixtureName),
            filename: typedFixturePath(validFixtureName),
            name: "accepts preferred and intentionally out-of-scope patterns from fixture",
        },
        {
            code: [
                'import { objectEntries, objectFromEntries } from "ts-extras";',
                "",
                'const statusById = { alpha: "up", beta: "down" } as const;',
                "",
                "const renamed = objectFromEntries(",
                '    objectEntries(statusById).map(([key, value]) => ["service-" + key, value])',
                ");",
                "",
                "String(renamed);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores callbacks that remap keys instead of preserving them",
        },
        {
            code: [
                'import { objectEntries, objectFromEntries } from "ts-extras";',
                "",
                'const statusById = { alpha: "up", beta: "down" } as const;',
                "",
                "const mapped = objectFromEntries(",
                "    objectEntries(statusById).map(function ([key, value]) {",
                '        return [key, key + ":" + value];',
                "    })",
                ");",
                "",
                "String(mapped);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores function-expression callbacks because this-binding semantics can differ",
        },
        {
            code: [
                'const statusById = { alpha: "up", beta: "down" } as const;',
                "",
                "const mapped = Object.fromEntries(",
                '    Object.entries(statusById).map(([key, value]) => [key, key + ":" + value])',
                ");",
                "",
                "String(mapped);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores native Object.entries/Object.fromEntries chains to avoid overlap with stable rules",
        },
        {
            code: [
                'import { objectEntries, objectFromEntries } from "ts-extras";',
                "",
                'const statusById = { alpha: "up", beta: "down" } as const;',
                'const thisArgument = { prefix: "service" } as const;',
                "",
                "const mapped = objectFromEntries(",
                "    objectEntries(statusById).map(",
                '        ([key, value]) => [key, key + ":" + value],',
                "        thisArgument",
                "    )",
                ");",
                "",
                "String(mapped);",
            ].join("\n"),
            filename: typedFixturePath(validFixtureName),
            name: "ignores map calls that pass a thisArg because objectMapValues has no equivalent callback binding parameter",
        },
    ],
});
