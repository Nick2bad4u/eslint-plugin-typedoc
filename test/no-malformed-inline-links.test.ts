import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-malformed-inline-links",
    getPluginRule("no-malformed-inline-links"),
    {
        invalid: [
            {
                name: "reports malformedInlineLink when {@link} is missing the target symbol and suggests a placeholder fix",
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
                                output: [
                                    "/**",
                                    " * See {@link TODO}.",
                                    " */",
                                    "export function run(): void {}",
                                ].join("\n"),
                            },
                        ],
                    },
                ],
            },
        ],
        valid: [
            {
                name: "is valid when {@link} includes a target symbol and display text",
                code: [
                    "/**",
                    " * See {@link run|run helper}.",
                    " */",
                    "export function run(): void {}",
                ].join("\n"),
            },
        ],
    }
);
