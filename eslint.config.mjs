import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

const typedocAllConfig = /** @type {unknown} */ (plugin.configs?.["all"]);
const typedocAllRules =
    typeof typedocAllConfig === "object" &&
    typedocAllConfig !== null &&
    "rules" in typedocAllConfig &&
    typeof typedocAllConfig.rules === "object" &&
    typedocAllConfig.rules !== null
        ? typedocAllConfig.rules
        : {};

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.withoutTypedoc,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        name: "Local TypeDoc",
        plugins: {
            typedoc: plugin,
        },
        rules: {
            ...typedocAllRules,

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
    {
        files: [
            "benchmarks/eslint-benchmark-config.mjs",
            "commitlint.config.mjs",
        ],
        name: "MJS Boundary Types",
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
