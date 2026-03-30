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
                    label: "🔵 Recommended",
                    type: "doc",
                },
                {
                    id: "presets/strict",
                    label: "🟠 Strict",
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
            collapsed: true,
            className: "sb-rules-catalog",
            customProps: {
                badge: "rules",
            },
            items: ruleDocIds.map((docId: string) => ({
                id: docId,
                label: formatRuleDocLabel(docId),
                type: "doc" as const,
            })),
            label: "Rule catalog",
            link: {
                description:
                    "Browse the full TypeDoc-focused rule catalog for this plugin.",
                slug: "/",
                title: "Rule catalog",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
