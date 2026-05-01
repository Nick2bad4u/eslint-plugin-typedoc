import nick2bad4u from "eslint-config-nick2bad4u";

import typedoc from "./plugin.mjs";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nick2bad4u.configs.withoutTypedoc,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        name: "Local TypeDoc",
        plugins: {
            typedoc: typedoc,
        },
        rules: {
            // @ts-expect-error -- plugin.mjs is typed as generic ESLint.Plugin.
            ...typedoc.configs.all.rules,

            "typedoc/no-empty-private-remarks-tag": "off",
            "typedoc/no-extra-type-param-tags": "off",
            "typedoc/no-unknown-tags": "warn",
            "typedoc/require-code-fence-language": "off",
            "typedoc/require-default-value-tag": "off",
            "typedoc/require-example-tag": "off",
            "typedoc/require-package-documentation": "off",
            "typedoc/require-package-documentation-description": "off",
            "typedoc/require-param-tag-description": "off",
            "typedoc/require-param-tags": "off",
            "typedoc/require-returns-description": "off",
            "typedoc/require-returns-tag": "off",
            "typedoc/require-see-tag-link": "off",
            "typedoc/require-since-tag-description": "off",
            "typedoc/require-throws-description": "off",
            "typedoc/require-throws-tag": "off",
            "typedoc/require-type-param-tag-description": "off",
            "typedoc/require-type-param-tags": "off",
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
