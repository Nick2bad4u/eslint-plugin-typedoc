/**
 * @packageDocumentation
 * Sidebar structure for the primary documentation section under `docs/`.
 */
import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/** Main sidebar configuration for the default docs plugin instance. */
const sidebars: SidebarsConfig = {
    docs: [
        {
            className: "sb-cat-developer",
            id: "developer/index",
            label: "Dev",
            type: "doc",
        },
        {
            className: "sb-cat-developer-ops",
            id: "developer/deploy-pages-seo-and-indexnow",
            label: "🚀 Pages SEO & IndexNow",
            type: "doc",
        },
        {
            className: "sb-cat-api-overview",
            collapsed: true,
            collapsible: true,
            customProps: {
                badge: "api-overview",
            },
            description:
                "Entry point for generated API docs and typed-path service inventory notes.",
            items: [
                {
                    className: "sb-api-overview-item",
                    id: "developer/api/plugin/index",
                    label: "🧩 Plugin API index",
                    type: "doc",
                },
                {
                    className: "sb-api-overview-item",
                    id: "developer/typed-paths",
                    label: "🧬 Typed paths inventory",
                    type: "doc",
                },
                {
                    className: "sb-api-overview-item",
                    id: "developer/api/plugin/type-aliases/TypefestPlugin",
                    label: "🧠 Type aliases · TypefestPlugin",
                    type: "doc",
                },
                {
                    className: "sb-api-overview-item",
                    id: "developer/api/plugin/variables/typefestPlugin",
                    label: "⚙️ Runtime exports · typefestPlugin",
                    type: "doc",
                },
                {
                    className: "sb-api-overview-item",
                    id: "developer/api/plugin/variables/typefestConfigs",
                    label: "⚙️ Runtime exports · typefestConfigs",
                    type: "doc",
                },
            ],
            label: "📘 API Overview",
            link: {
                id: "developer/api/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-developer-adr",
            collapsed: true,
            customProps: {
                badge: "adr",
            },
            items: [
                {
                    id: "developer/adr/index",
                    label: "📚 ADR Index",
                    type: "doc",
                },
                {
                    id: "developer/adr/eslint-plugin-kit-adoption",
                    label: "ADR 0001 · Plugin Kit",
                    type: "doc",
                },
                {
                    id: "developer/adr/eslint-config-helpers-scope",
                    label: "ADR 0002 · Config Helpers",
                    type: "doc",
                },
                {
                    id: "developer/adr/eslint-object-schema-adoption",
                    label: "ADR 0003 · Object Schema",
                    type: "doc",
                },
                {
                    id: "developer/adr/rule-docs-specificity-and-shared-guides",
                    label: "ADR 0004 · Rule Doc Specificity",
                    type: "doc",
                },
                {
                    id: "developer/adr/runtime-vs-type-level-rule-families",
                    label: "ADR 0005 · Rule Families",
                    type: "doc",
                },
                {
                    id: "developer/adr/canonical-rule-doc-urls-use-docusaurus-routes",
                    label: "ADR 0006 · Docs URL Canonicalization",
                    type: "doc",
                },
                {
                    id: "developer/adr/rule-doc-footer-links-to-shared-guides",
                    label: "ADR 0007 · Rule Footer Guide Links",
                    type: "doc",
                },
                {
                    id: "developer/adr/typedoc-generation-ci-local-strategy",
                    label: "ADR 0008 · TypeDoc CI/Local Strategy",
                    type: "doc",
                },
                {
                    id: "developer/adr/plugin-blog-as-docs-channel",
                    label: "ADR 0009 · Blog Docs Channel",
                    type: "doc",
                },
                {
                    id: "developer/adr/autofix-governance-and-global-kill-switch",
                    label: "ADR 0010 · Autofix Governance",
                    type: "doc",
                },
                {
                    id: "developer/adr/type-aware-rule-contract-and-fail-fast-behavior",
                    label: "ADR 0011 · Typed Rule Contract",
                    type: "doc",
                },
                {
                    id: "developer/adr/internal-api-surface-and-stability-contract",
                    label: "ADR 0012 · Internal API Boundary",
                    type: "doc",
                },
                {
                    id: "developer/adr/docs-link-integrity-and-anchor-stability-policy",
                    label: "ADR 0013 · Link Integrity Policy",
                    type: "doc",
                },
                {
                    id: "developer/adr/typed-rule-performance-budget-and-instrumentation",
                    label: "ADR 0014 · Performance Budget",
                    type: "doc",
                },
                {
                    id: "developer/adr/preset-semver-and-deprecation-policy",
                    label: "ADR 0015 · Preset Semver Policy",
                    type: "doc",
                },
            ],
            label: "🧭 Architecture Decisions",
            collapsible: true,
            description:
                "Architectural decisions and design rationale for eslint-plugin-typefest.",
            link: {
                id: "developer/adr/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-dev-charts",
            collapsed: true,
            customProps: {
                badge: "charts",
            },
            items: [
                {
                    id: "developer/charts/index",
                    label: "📊 Charts Index",
                    type: "doc",
                },
                {
                    id: "developer/charts/system-architecture-overview",
                    label: "System Architecture",
                    type: "doc",
                },
                {
                    id: "developer/charts/rule-lifecycle-and-autofix-flow",
                    label: "Rule Lifecycle & Autofix",
                    type: "doc",
                },
                {
                    id: "developer/charts/docs-and-api-pipeline",
                    label: "Docs & API Pipeline",
                    type: "doc",
                },
                {
                    id: "developer/charts/rule-catalog-and-doc-sync",
                    label: "Rule Catalog & Doc Sync",
                    type: "doc",
                },
                {
                    id: "developer/charts/change-impact-and-validation-matrix",
                    label: "Change Impact Matrix",
                    type: "doc",
                },
                {
                    id: "developer/charts/quality-gates-and-release-flow",
                    label: "Quality Gates & Release",
                    type: "doc",
                },
                {
                    id: "developer/charts/typed-rule-semantic-analysis-flow",
                    label: "Typed Rule Semantic Flow",
                    type: "doc",
                },
                {
                    id: "developer/charts/import-safe-autofix-decision-tree",
                    label: "Import-Safe Autofix Tree",
                    type: "doc",
                },
                {
                    id: "developer/charts/preset-composition-and-rule-matrix",
                    label: "Preset Composition Matrix",
                    type: "doc",
                },
                {
                    id: "developer/charts/docs-link-integrity-and-anchor-stability",
                    label: "Docs Link Integrity",
                    type: "doc",
                },
                {
                    id: "developer/charts/typed-rule-performance-budget-and-hotspots",
                    label: "Typed Rule Performance Budget",
                    type: "doc",
                },
                {
                    id: "developer/charts/diagnostics-and-regression-triage-loop",
                    label: "Diagnostics Triage Loop",
                    type: "doc",
                },
                {
                    id: "developer/charts/preset-semver-and-deprecation-lifecycle",
                    label: "Preset Semver Lifecycle",
                    type: "doc",
                },
                {
                    id: "developer/charts/rule-authoring-to-release-lifecycle",
                    label: "Rule Authoring Lifecycle",
                    type: "doc",
                },
                {
                    id: "developer/charts/typed-services-guard-and-fallback-paths",
                    label: "Typed Services Guard Paths",
                    type: "doc",
                },
            ],
            label: "Charts",
            collapsible: true,
            description:
                "Visual aids for understanding plugin architecture, processes, and policies.",
            link: {
                id: "developer/charts/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-api-types",
            collapsed: true,
            collapsible: true,
            description:
                "Type-level contracts and shared type aliases exposed by the plugin.",
            customProps: {
                badge: "types",
            },
            items: [
                {
                    dirName: "developer/api/plugin/type-aliases",
                    type: "autogenerated",
                },
            ],
            label: "Types",
            link: {
                description:
                    "Type-level contracts and shared type aliases exposed by the plugin.",
                title: "Type Aliases",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-api-runtime",
            collapsed: true,
            collapsible: true,
            description:
                "Runtime API references for rule authoring and plugin extension.",
            customProps: {
                badge: "runtime",
            },
            items: [
                {
                    collapsed: true,
                    collapsible: true,
                    items: [
                        {
                            dirName: "developer/api/plugin/variables",
                            type: "autogenerated",
                        },
                    ],
                    label: "Plugin variables",
                    type: "category",
                },
                {
                    collapsed: true,
                    collapsible: true,
                    items: [
                        {
                            dirName: "developer/api/internal",
                            type: "autogenerated",
                        },
                    ],
                    label: "Internal API",
                    type: "category",
                },
            ],
            label: "Runtime",
            link: {
                description:
                    "Runtime exports and internal utility API references from eslint-plugin-typefest.",
                title: "Runtime Exports",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-dev-links",
            collapsed: true,
            collapsible: true,
            customProps: {
                badge: "links",
            },
            description:
                "External package docs, project blog resources, and issue tracker links.",
            items: [
                {
                    href: "https://github.com/sindresorhus/ts-extras",
                    label: "💠 \ue709 ts-extras",
                    type: "link",
                },
                {
                    href: "https://www.npmjs.com/package/ts-extras",
                    label: "💠 \ue616 ts-extras",
                    type: "link",
                },
                {
                    href: "https://github.com/sindresorhus/type-fest",
                    label: "✴️ \ue709 type-fest",
                    type: "link",
                },
                {
                    href: "https://www.npmjs.com/package/type-fest",
                    label: "✴️ \ue616 type-fest",
                    type: "link",
                },
                {
                    href: "/blog",
                    label: "📰 Blog posts",
                    type: "link",
                },
                {
                    href: "/blog/the-thinking-behind-eslint-plugin-typefest",
                    label: "🧠 Blog · Thinking behind plugin",
                    type: "link",
                },
                {
                    href: "/blog/designing-safe-autofixes-for-eslint-plugin-typefest",
                    label: "🛡️ Blog · Designing safe autofixes",
                    type: "link",
                },
                {
                    href: "/blog/type-aware-linting-without-surprises",
                    label: "🧪 Blog · Type-aware linting without surprises",
                    type: "link",
                },
                {
                    href: "/blog/keeping-rule-docs-and-presets-in-sync",
                    label: "🧭 Blog · Keeping docs and presets in sync",
                    type: "link",
                },
                {
                    href: "/blog/archive",
                    label: "🗂 Blog archive",
                    type: "link",
                },
                {
                    href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues?q=is%3Aissue%20is%3Aopen",
                    label: "🐛 Open issues",
                    type: "link",
                },
                {
                    href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues?q=is%3Aissue%20is%3Aopen%20label%3Abug",
                    label: "🐞 Issues · bug",
                    type: "link",
                },
                {
                    href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues?q=is%3Aissue%20is%3Aopen%20label%3Adocumentation",
                    label: "📚 Issues · documentation",
                    type: "link",
                },
                {
                    href: "https://github.com/Nick2bad4u/eslint-plugin-typefest/issues?q=is%3Aissue%20is%3Aopen%20label%3Arules",
                    label: "🧩 Issues · rules",
                    type: "link",
                },
            ],
            label: "🌐 Links",
            type: "category",
        },
    ],
};

export default sidebars;
