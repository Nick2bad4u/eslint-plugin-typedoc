/**
 * @packageDocumentation
 * Sidebar structure for the primary docs plugin (`docs/docusaurus/site-docs`).
 */

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    docs: [
        {
            id: "intro",
            label: "🏁 Intro",
            type: "doc",
        },
        {
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            href: "/docs/rules/overview",
            label: "📚 Rule reference",
            type: "link",
        },
    ],
};

export default sidebars;
