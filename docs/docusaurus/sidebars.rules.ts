/**
 * @packageDocumentation
 * Sidebar structure for rule documentation under `docs/rules`.
 */

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebarDirectoryPath = dirname(fileURLToPath(import.meta.url));
const rulesDirectoryPath = join(sidebarDirectoryPath, "..", "rules");

const formatRuleDocLabel = (docId: string): string =>
    docId
        .split("-")
        .map((segment) =>
            segment.length === 0
                ? segment
                : `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`
        )
        .join(" ");

const ruleDocIds = readdirSync(rulesDirectoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.slice(0, -3))
    .filter(
        (docId) =>
            docId !== "overview" &&
            docId !== "getting-started" &&
            !docId.startsWith("presets")
    )
    .sort((left: string, right: string) => left.localeCompare(right));

type RuleGroupDefinition = Readonly<{
    className: string;
    itemClassName: string;
    label: string;
    prefix: string;
}>;

const ruleGroupDefinitions: readonly RuleGroupDefinition[] = [
    {
        className: "sb-rules-group-no",
        itemClassName: "sb-rules-rule-item-no",
        label: "🛑 no-*",
        prefix: "no-",
    },
    {
        className: "sb-rules-group-prefer",
        itemClassName: "sb-rules-rule-item-prefer",
        label: "✨ prefer-*",
        prefix: "prefer-",
    },
    {
        className: "sb-rules-group-require",
        itemClassName: "sb-rules-rule-item-require",
        label: "📏 require-*",
        prefix: "require-",
    },
    {
        className: "sb-rules-group-config",
        itemClassName: "sb-rules-rule-item-config",
        label: "⚙️ typedoc-config-*",
        prefix: "typedoc-config-",
    },
];

const toIndexedRuleLabel = (index: number, docId: string): string =>
    `${String(index + 1).padStart(2, "0")} ${formatRuleDocLabel(docId)}`;

const toRuleDocItem = (
    docId: string,
    index: number,
    itemClassName: string
) => ({
    className: `sb-rules-rule-item ${itemClassName}`,
    id: docId,
    label: toIndexedRuleLabel(index, docId),
    type: "doc" as const,
});

const usedRuleDocIds = new Set<string>();

const groupedRuleCategoryItems = ruleGroupDefinitions
    .map((groupDefinition) => {
        const groupedRuleDocIds = ruleDocIds.filter((docId) =>
            docId.startsWith(groupDefinition.prefix)
        );

        for (const groupedRuleDocId of groupedRuleDocIds) {
            usedRuleDocIds.add(groupedRuleDocId);
        }

        return {
            className: groupDefinition.className,
            collapsed: true,
            items: groupedRuleDocIds.map((docId, index) =>
                toRuleDocItem(docId, index, groupDefinition.itemClassName)
            ),
            label: groupDefinition.label,
            type: "category" as const,
        };
    })
    .filter((groupCategory) => groupCategory.items.length > 0);

const otherRuleDocIds = ruleDocIds.filter(
    (docId) => !usedRuleDocIds.has(docId)
);

if (otherRuleDocIds.length > 0) {
    groupedRuleCategoryItems.push({
        className: "sb-rules-group-other",
        collapsed: true,
        items: otherRuleDocIds.map((docId, index) =>
            toRuleDocItem(docId, index, "sb-rules-rule-item-other")
        ),
        label: "🧩 Other rules",
        type: "category",
    });
}

const sidebars = {
    rules: [
        {
            id: "overview",
            label: "🏁 Overview",
            className: "sb-rules-overview",
            type: "doc",
        },
        {
            id: "getting-started",
            label: "🚀 Getting Started",
            className: "sb-rules-started",
            type: "doc",
        },
        {
            collapsed: true,
            className: "sb-rules-adoption",
            items: [
                {
                    id: "presets/minimal",
                    label: "🟢 Start with minimal",
                    type: "ref",
                },
                {
                    id: "presets/recommended",
                    label: "🟡 Expand with recommended",
                    type: "ref",
                },
                {
                    id: "presets/strict",
                    label: "🟠 Tighten with strict",
                    type: "ref",
                },
                {
                    id: "presets/all",
                    label: "🔴 Full policy with all",
                    type: "ref",
                },
            ],
            label: "🧭 Adoption & Rollout",
            link: {
                description:
                    "Stage TypeDoc policy adoption from minimal through strict/all with low-noise rollout sequencing.",
                slug: "/adoption-rollout",
                title: "Adoption & Rollout",
                type: "generated-index",
            },
            type: "category",
        },
        {
            collapsed: false,
            className: "sb-rules-presets",
            customProps: {
                badge: "presets",
            },
            items: [
                {
                    id: "presets/minimal",
                    label: "🟢 Minimal",
                    type: "doc",
                },
                {
                    id: "presets/recommended",
                    label: "🟡 Recommended",
                    type: "doc",
                },
                {
                    id: "presets/markdown",
                    label: "📝 Markdown",
                    type: "doc",
                },
                {
                    id: "presets/tsdoc",
                    label: "📗 TSDoc",
                    type: "doc",
                },
                {
                    id: "presets/jsdoc",
                    label: "📘 JSDoc",
                    type: "doc",
                },
                {
                    id: "presets/strict",
                    label: "🔴 Strict",
                    type: "doc",
                },
                {
                    id: "presets/all",
                    label: "🟣 All",
                    type: "doc",
                },
            ],
            label: "Presets",
            link: {
                id: "presets/index",
                type: "doc",
            },
            type: "category",
        },
        {
            collapsed: false,
            className: "sb-rules-root",
            customProps: {
                badge: "rules",
            },
            items: groupedRuleCategoryItems,
            label: "Rules",
            link: {
                description:
                    "Browse the full TypeDoc-focused rule catalog, grouped by rule family.",
                slug: "/",
                title: "Rules",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
