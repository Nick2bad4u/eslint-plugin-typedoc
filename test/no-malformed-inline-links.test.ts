import { getPluginRule, createRuleTester } from "./_internal/ruleTester.js";

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
