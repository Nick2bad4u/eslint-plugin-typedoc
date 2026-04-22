import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "typedoc-config-requires-options",
    getPluginRule("typedoc-config-requires-options"),
    {
        invalid: [
            {
                code: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    "};",
                ].join("\n"),
                errors: [{ messageId: "missingTypedocConfigOptions" }],
                filename: "typedoc.config.ts",
                name: "reports missingTypedocConfigOptions and auto-adds entryPoints and tsconfig for config with only entryPoints",
                output: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    '    tsconfig: "./tsconfig.json"',
                    "};",
                ].join("\n"),
            },
            {
                code: ["export default {};"].join("\n"),
                errors: [{ messageId: "missingTypedocConfigOptions" }],
                filename: "typedoc.config.ts",
                name: "reports missingTypedocConfigOptions and auto-adds entryPoints and tsconfig for empty config object",
                output: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    '    tsconfig: "./tsconfig.json"',
                    "};",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    '    tsconfig: "./tsconfig.json"',
                    "};",
                ].join("\n"),
                filename: "typedoc.config.ts",
                name: "is valid when typedoc.config.ts has both entryPoints and tsconfig options",
            },
            {
                code: "export default {};",
                filename: "src/index.ts",
                name: "is valid for non-typedoc config file (filename does not match the rule pattern)",
            },
        ],
    }
);
