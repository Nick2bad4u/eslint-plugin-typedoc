import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "typedoc-config-requires-options",
    getPluginRule("typedoc-config-requires-options"),
    {
        invalid: [
            {
                name: "reports missingTypedocConfigOptions and auto-adds entryPoints and tsconfig for config with only entryPoints",
                code: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    "};",
                ].join("\n"),
                filename: "typedoc.config.ts",
                errors: [{ messageId: "missingTypedocConfigOptions" }],
                output: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    '    tsconfig: "./tsconfig.json"',
                    "};",
                ].join("\n"),
            },
            {
                name: "reports missingTypedocConfigOptions and auto-adds entryPoints and tsconfig for empty config object",
                code: ["export default {};"].join("\n"),
                filename: "typedoc.config.ts",
                errors: [{ messageId: "missingTypedocConfigOptions" }],
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
                name: "is valid when typedoc.config.ts has both entryPoints and tsconfig options",
                code: [
                    "export default {",
                    '    entryPoints: ["src/index.ts"],',
                    '    tsconfig: "./tsconfig.json"',
                    "};",
                ].join("\n"),
                filename: "typedoc.config.ts",
            },
            {
                name: "is valid for non-typedoc config file (filename does not match the rule pattern)",
                code: "export default {};",
                filename: "src/index.ts",
            },
        ],
    }
);
