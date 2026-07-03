import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

const VALID_RULE_TYPES = new Set<string>([
    "layout",
    "problem",
    "suggestion",
]);

describe("plugin entry", () => {
    it("exposes typedoc plugin meta", () => {
        expect.hasAssertions();

        expect(typedocPlugin.meta?.name).toBe("eslint-plugin-typedoc");
        expect(typedocPlugin.meta?.namespace).toBe("typedoc");
        expect(typedocPlugin.meta?.version).toBeTypeOf("string");
    });

    it("registers the expected rule set", () => {
        expect.hasAssertions();

        const ruleNames = Object.keys(typedocPlugin.rules ?? {}).toSorted(
            (left, right) => left.localeCompare(right)
        );

        expect(ruleNames).toStrictEqual([
            "no-duplicate-param-tags",
            "no-duplicate-type-param-tags",
            "no-empty-example-tag",
            "no-empty-private-remarks-tag",
            "no-empty-remarks-tag",
            "no-empty-see-tag",
            "no-extra-param-tags",
            "no-extra-type-param-tags",
            "no-malformed-inline-links",
            "no-unknown-tags",
            "prefer-package-documentation-tag",
            "prefer-type-param-tag",
            "require-code-fence-language",
            "require-default-value-tag",
            "require-deprecated-tag-description",
            "require-example-tag",
            "require-exported-doc-comment",
            "require-exported-doc-comment-description",
            "require-package-documentation",
            "require-package-documentation-description",
            "require-param-tag-description",
            "require-param-tags",
            "require-returns-description",
            "require-returns-tag",
            "require-see-tag-link",
            "require-since-tag-description",
            "require-throws-description",
            "require-throws-tag",
            "require-type-param-tag-description",
            "require-type-param-tags",
            "typedoc-config-requires-options",
        ]);
    });

    it("exports all expected presets", () => {
        expect.hasAssertions();

        expect(
            Object.keys(typedocPlugin.configs ?? {}).toSorted((left, right) =>
                left.localeCompare(right)
            )
        ).toStrictEqual([
            "all",
            "jsdoc",
            "markdown",
            "minimal",
            "recommended",
            "strict",
            "tsdoc",
        ]);
    });

    describe("rule module contracts", () => {
        const rules = Object.entries(typedocPlugin.rules ?? {});

        it("has at least one registered rule", () => {
            expect.hasAssertions();

            expect(rules.length).toBeGreaterThan(0);
        });

        it.each(rules)('"%s" has a valid meta.type', (_name, rule) => {
            expect.hasAssertions();

            expect(
                VALID_RULE_TYPES.has(rule.meta?.type as string),
                `meta.type must be one of: ${[...VALID_RULE_TYPES].join(", ")}`
            ).toBe(true);
        });

        it.each(rules)('"%s" has at least one message', (_name, rule) => {
            expect.hasAssertions();

            const messageKeys = Object.keys(rule.meta?.messages ?? {});

            expect(messageKeys.length).toBeGreaterThan(0);
        });

        it.each(rules)('"%s" has an array schema', (_name, rule) => {
            expect.hasAssertions();

            expect(Array.isArray(rule.meta?.schema)).toBe(true);
        });

        it.each(rules)('"%s" has a non-empty docs.url', (_name, rule) => {
            expect.hasAssertions();

            expect(rule.meta?.docs?.url).toBeTypeOf("string");
            expect((rule.meta?.docs?.url ?? "").length).toBeGreaterThan(0);
        });

        it.each(rules)(
            '"%s" has a non-empty docs.description',
            (_name, rule) => {
                expect.hasAssertions();

                expect(rule.meta?.docs?.description).toBeTypeOf("string");
                expect(
                    (rule.meta?.docs?.description ?? "").trim().length
                ).toBeGreaterThan(0);
            }
        );

        it.each(rules)('"%s" has a boolean docs.recommended', (_name, rule) => {
            expect.hasAssertions();

            // Every rule must explicitly declare whether it belongs to the
            // recommended preset.  This mirrors the `require-meta-docs-recommended`
            // lint rule but as a hard contract test so the check cannot be
            // downgraded below "error" without failing the test suite.
            expect(
                (rule.meta?.docs as Record<string, unknown> | undefined)?.[
                    "recommended"
                ]
            ).toBeTypeOf("boolean");
        });

        it.each(rules)(
            '"%s" has a boolean docs.requiresTypeChecking',
            (_name, rule) => {
                expect.hasAssertions();

                // Every rule must explicitly declare whether it requires access
                // to the TypeScript type-checker.  Rules that call parser
                // services must set this to `true`; rules that only analyse
                // syntax set it to `false`.
                expect(
                    (rule.meta?.docs as Record<string, unknown> | undefined)?.[
                        "requiresTypeChecking"
                    ]
                ).toBeTypeOf("boolean");
            }
        );

        it.each(rules)('"%s" has a boolean docs.frozen', (_name, rule) => {
            expect.hasAssertions();

            // Every rule must explicitly declare whether it is frozen
            // (i.e. the rule API is considered stable and will not
            // receive breaking changes in a patch release).
            // This property drives the frozen-indicator in the docs site.
            expect(
                (rule.meta?.docs as Record<string, unknown> | undefined)?.[
                    "frozen"
                ]
            ).toBeTypeOf("boolean");
        });

        it.each(rules)(
            '"%s" has an array docs.typedocConfigs',
            (_name, rule) => {
                expect.hasAssertions();

                // Every rule must declare which TypeDoc configuration properties
                // it relates to.  The array may be empty for rules that are not
                // tied to a specific TypeDoc config option, but the property
                // must always be present so the docs site can render it
                // consistently.
                const docs = rule.meta?.docs as
                    Record<string, unknown> | undefined;

                expect(Array.isArray(docs?.["typedocConfigs"])).toBe(true);
            }
        );
    });

    describe("preset contracts", () => {
        const configs = Object.entries(typedocPlugin.configs ?? {});

        it("each preset is a plain config object (not an array)", () => {
            expect.hasAssertions();

            for (const [name, config] of configs) {
                expect(
                    typeof config === "object" &&
                        config !== null &&
                        !Array.isArray(config),
                    `preset "${name}" should be a Linter.Config object`
                ).toBe(true);
            }
        });

        it("each preset enables at least one rule", () => {
            expect.hasAssertions();

            for (const [name, config] of configs) {
                const ruleCount = Object.keys(
                    (config as { rules?: Record<string, unknown> }).rules ?? {}
                ).length;

                expect(
                    ruleCount,
                    `preset "${name}" should enable at least one rule`
                ).toBeGreaterThan(0);
            }
        });
    });
});
