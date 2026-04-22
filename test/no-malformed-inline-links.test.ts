import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-malformed-inline-links",
    getPluginRule("no-malformed-inline-links"),
    {
        invalid: [
            {
                code: [
                    "/**",
                    " * See {@link}.",
                    " */",
                    "export function run(): void {}",
                ].join("\n"),
                errors: [
                    {
                        messageId: "malformedInlineLink",
                        suggestions: [
                            {
                                messageId: "replaceWithPlaceholder",
                                output: "/**\n * See {@link reference}.\n */\nexport function run(): void {}",
                            },
                        ],
                    },
                ],
                name: "reports malformedInlineLink when {@link} is missing the target symbol and suggests a placeholder fix",
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * See {@link run|run helper}.",
                    " */",
                    "export function run(): void {}",
                ].join("\n"),
                name: "is valid when {@link} includes a target symbol and display text",
            },
        ],
    }
);
