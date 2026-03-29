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
            },
            {
                code: "export default {};",
                filename: "src/index.ts",
            },
        ],
    }
);
