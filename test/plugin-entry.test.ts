import { describe, expect, it } from "vitest";

import typedocPlugin from "../src/plugin.js";

const VALID_RULE_TYPES = new Set<string>([
    "layout",
    "problem",
    "suggestion",
]);

describe("plugin entry", () => {
    it("exposes typedoc plugin meta", () => {
        expect(typedocPlugin.meta?.name).toBe("eslint-plugin-typedoc");
        expect(typedocPlugin.meta?.namespace).toBe("typedoc");
        expect(typeof typedocPlugin.meta?.version).toBe("string");
    });

    it("registers the expected rule set", () => {
        const ruleNames = Object.keys(typedocPlugin.rules ?? {}).toSorted(
            (left, right) => left.localeCompare(right)
        );

        expect(ruleNames).toEqual([
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
        expect(
            Object.keys(typedocPlugin.configs ?? {}).toSorted((left, right) =>
                left.localeCompare(right)
            )
        ).toEqual([
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
            expect(rules.length).toBeGreaterThan(0);
        });

        it.each(rules)('"%s" has a valid meta.type', (_name, rule) => {
            expect(
                VALID_RULE_TYPES.has(rule.meta?.type as string),
                `meta.type must be one of: ${[...VALID_RULE_TYPES].join(", ")}`
            ).toBeTruthy();
        });

        it.each(rules)('"%s" has at least one message', (_name, rule) => {
            const messageKeys = Object.keys(rule.meta?.messages ?? {});

            expect(messageKeys.length).toBeGreaterThan(0);
        });

        it.each(rules)('"%s" has an array schema', (_name, rule) => {
            expect(Array.isArray(rule.meta?.schema)).toBeTruthy();
        });

        it.each(rules)('"%s" has a non-empty docs.url', (_name, rule) => {
            expect(typeof rule.meta?.docs?.url).toBe("string");
            expect((rule.meta?.docs?.url ?? "").length).toBeGreaterThan(0);
        });

        it.each(rules)(
            '"%s" has a non-empty docs.description',
            (_name, rule) => {
                expect(typeof rule.meta?.docs?.description).toBe("string");
                expect(
                    (rule.meta?.docs?.description ?? "").trim().length
                ).toBeGreaterThan(0);
            }
        );
    });

    describe("preset contracts", () => {
        const configs = Object.entries(typedocPlugin.configs ?? {});

        it("each preset is a plain config object (not an array)", () => {
            for (const [name, config] of configs) {
                expect(
                    typeof config === "object" &&
                        config !== null &&
                        !Array.isArray(config),
                    `preset "${name}" should be a Linter.Config object`
                ).toBeTruthy();
            }
        });

        it("each preset enables at least one rule", () => {
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
