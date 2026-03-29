import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    rules: [
        "overview",
        "getting-started",
        {
            type: "category",
            label: "Rules",
            items: [
                "enforce-typedoc-tags",
                "no-typedoc-tag-alias",
                "no-unresolved-typedoc-link",
                "require-export-docs",
                "require-typedoc-config-options",
            ],
        },
        {
            type: "category",
            label: "Presets",
            items: [
                "presets/index",
                "presets/minimal",
                "presets/recommended",
                "presets/strict",
                "presets/all",
            ],
        },
    ],
};

export default sidebars;
