/**
 * @packageDocumentation
 * Dynamic sidebar generation for plugin rule documentation sections.
 */
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Minimal document item shape used by generated rule categories. */
type SidebarDocItem = {
    readonly label: string;
    readonly id: string;
    readonly type: "doc";
};

/** Directory containing this sidebar module. */
const sidebarDirectoryPath = dirname(fileURLToPath(import.meta.url));
/** Directory containing generated rule docs consumed by the sidebar. */
const rulesDirectoryPath = join(sidebarDirectoryPath, "..", "rules");

/** Check whether a directory entry name is a markdown file. */
const isMarkdownFile = (fileName: string): boolean => fileName.endsWith(".md");

/** Convert a markdown filename (e.g. `foo.md`) to a Docusaurus doc id. */
const toRuleDocId = (fileName: string): string => fileName.slice(0, -3);

/** Sorted rule-doc ids discovered from `docs/rules/*.md`. */
const allRuleDocIds = readdirSync(rulesDirectoryPath, {
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && isMarkdownFile(entry.name))
    .map((entry) => toRuleDocId(entry.name))
    .sort((left, right) => left.localeCompare(right));

/** Rule docs eligible for numbered display in the Rules sidebar section. */
const allNumberedRuleDocIds = allRuleDocIds.filter((ruleDocId) =>
    ruleDocId.startsWith("prefer-")
);

/** Resolve a stable one-based rule number for each numbered rule doc id. */
const ruleNumberByDocId = new Map<string, number>(
    allNumberedRuleDocIds.map((ruleDocId, index) => [ruleDocId, index + 1])
);

/** Format a sidebar label with a stable numeric prefix. */
const toNumberedRuleLabel = (ruleNumber: number, ruleDocId: string): string =>
    `${String(ruleNumber).padStart(2, "0")} ${ruleDocId}`;

/** Build sidebar doc items for rule docs matching a given filename prefix. */
const createRuleItemsByPrefix = (prefix: string): SidebarDocItem[] =>
    allRuleDocIds
        .filter((ruleDocId) => ruleDocId.startsWith(prefix))
        .map((ruleDocId) => {
            const ruleNumber = ruleNumberByDocId.get(ruleDocId);

            if (ruleNumber === undefined) {
                throw new TypeError(
                    `Missing stable sidebar rule number for '${ruleDocId}'.`
                );
            }

            return {
                id: ruleDocId,
                label: toNumberedRuleLabel(ruleNumber, ruleDocId),
                type: "doc",
            };
        });

/** Sidebar entries for `prefer-ts-extras-*` rule docs. */
const tsExtrasRuleItems = createRuleItemsByPrefix("prefer-ts-extras-");
/** Sidebar entries for `prefer-type-fest-*` rule docs. */
const typeFestRuleItems = createRuleItemsByPrefix("prefer-type-fest-");

/** Complete sidebar structure for docs site navigation. */
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "🏁 Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-guides",
            collapsed: true,
            customProps: {
                badge: "guides",
            },
            type: "category",
            label: "🧭 Adoption & Rollout",
            link: {
                type: "generated-index",
                title: "Adoption & Rollout",
                description:
                    "Shared migration, rollout, and fix-safety guidance for rule adoption.",
            },
            items: [
                {
                    id: "guides/adoption-checklist",
                    label: "✅ Adoption checklist",
                    type: "doc",
                },
                {
                    id: "guides/rollout-and-fix-safety",
                    label: "🛡️ Rollout and fix safety",
                    type: "doc",
                },
                {
                    id: "guides/preset-selection-strategy",
                    label: "💭 Preset selection strategy",
                    type: "doc",
                },
                {
                    id: "guides/type-aware-linting-readiness",
                    label: "🧪 Type-aware linting readiness",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-presets",
            collapsed: true,
            customProps: {
                badge: "presets",
            },
            type: "category",
            label: "Presets",
            link: {
                type: "doc",
                id: "presets/index",
            },
            items: [
                {
                    className: "sb-preset-minimal",
                    id: "presets/minimal",
                    label: "🟢 Minimal",
                    type: "doc",
                },
                {
                    className: "sb-preset-recommended",
                    id: "presets/recommended",
                    label: "🟡 Recommended",
                    type: "doc",
                },
                {
                    className: "sb-preset-recommended-type-checked",
                    id: "presets/recommended-type-checked",
                    label: "🟠 Recommended (type-checked)",
                    type: "doc",
                },
                {
                    className: "sb-preset-strict",
                    id: "presets/strict",
                    label: "🔴 Strict",
                    type: "doc",
                },
                {
                    className: "sb-preset-all",
                    id: "presets/all",
                    label: "🟣 All",
                    type: "doc",
                },
                {
                    className: "sb-preset-type-fest",
                    id: "presets/type-fest-types",
                    label: "💠 type-fest",
                    type: "doc",
                },
                {
                    className: "sb-preset-type-guards",
                    id: "presets/ts-extras-type-guards",
                    label: "✴️ type-guards",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            customProps: {
                badge: "rules",
            },
            type: "category",
            label: "Rules",
            link: {
                type: "generated-index",
                title: "Rule Reference",
                slug: "/",
                description:
                    "Rule documentation for every eslint-plugin-typefest rule.",
            },
            items: [
                {
                    className: "sb-cat-rules-ts-extras",
                    collapsed: true,
                    collapsible: true,
                    customProps: {
                        badge: "ts-extras",
                    },
                    type: "category",
                    label: "ts-extras",
                    link: {
                        type: "generated-index",
                        title: "ts-extras Rules",
                        description:
                            "Rules that prefer ts-extras runtime helpers and utility functions.",
                    },
                    items: tsExtrasRuleItems,
                },
                {
                    className: "sb-cat-rules-type-fest",
                    collapsed: true,
                    collapsible: true,
                    customProps: {
                        badge: "type-fest",
                    },
                    type: "category",
                    label: "type-fest",
                    link: {
                        type: "generated-index",
                        title: "type-fest Rules",
                        description:
                            "Rules that prefer expressive type-fest utility types for clearer type-level code.",
                    },
                    items: typeFestRuleItems,
                },
            ],
        },
    ],
};

export default sidebars;
