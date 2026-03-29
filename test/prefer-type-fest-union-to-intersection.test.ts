import { describe, expect, it } from "vitest";

import { addTypeFestRuleMetadataSmokeTests } from "./_internal/rule-metadata-smoke";
import { getPluginRule } from "./_internal/ruleTester";
import { createTypedRuleTester } from "./_internal/typed-rule-tester";

const ruleId = "prefer-type-fest-union-to-intersection";
const docsDescription =
    "require TypeFest UnionToIntersection over custom distributive conditional helpers that turn unions into intersections.";
const docsUrl =
    "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-to-intersection";
const preferUnionToIntersectionMessage =
    "Prefer `UnionToIntersection<Union>` from type-fest over custom distributive conditional helpers that convert a union into an intersection.";

const ruleTester = createTypedRuleTester();
const rule = getPluginRule(ruleId);

addTypeFestRuleMetadataSmokeTests(ruleId, {
    defaultOptions: [],
    docsDescription,
    messages: {
        preferUnionToIntersection: preferUnionToIntersectionMessage,
    },
    name: ruleId,
});

describe("prefer-type-fest-union-to-intersection metadata literals", () => {
    it("declares the authored docs URL literal", () => {
        expect(rule.meta.docs?.url).toBe(docsUrl);
    });
});

ruleTester.run(ruleId, rule, {
    invalid: [
        {
            code: [
                'import type { UnionToIntersection } from "type-fest";',
                "",
                "type MergeUnion<Union> =",
                "    (Union extends unknown ? (value: Union) => void : never) extends",
                "        (value: infer Intersection) => void",
                "        ? Intersection",
                "        : never;",
                "",
                "type Preferred<Union> = UnionToIntersection<Union>;",
            ].join("\n"),
            errors: [{ messageId: "preferUnionToIntersection" }],
            name: "reports canonical union-to-intersection helpers",
        },
        {
            code: [
                'import type { UnionToIntersection } from "type-fest";',
                "",
                "type MergeUnion<Union> =",
                "    (Union extends any ? (value: Union) => void : never) extends",
                "        (value: infer Intersection) => void",
                "        ? Intersection & Union",
                "        : never;",
                "",
                "type Preferred<Union> = UnionToIntersection<Union>;",
            ].join("\n"),
            errors: [{ messageId: "preferUnionToIntersection" }],
            name: "reports the assignable intersection variant too",
        },
    ],
    valid: [
        {
            code: [
                'import type { UnionToIntersection } from "type-fest";',
                "",
                "type MergeUnion<Union> = UnionToIntersection<Union>;",
            ].join("\n"),
            name: "accepts preferred UnionToIntersection usage",
        },
        {
            code: [
                "type KeepOnlyStrings<Union> = Union extends string ? Union : never;",
            ].join("\n"),
            name: "ignores unrelated conditional helpers",
        },
    ],
});
