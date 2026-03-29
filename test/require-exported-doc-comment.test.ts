import { getPluginRule, createRuleTester } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-exported-doc-comment",
    getPluginRule("require-exported-doc-comment"),
    {
        invalid: [
            {
                code: "export function buildClient(): void {}",
                errors: [{ messageId: "missingDocComment" }],
                output: [
                    "/**",
                    " * TODO: Document buildClient.",
                    " */",
                    "export function buildClient(): void {}",
                ].join("\n"),
            },
        ],
        valid: [
            {
                code: [
                    "/**",
                    " * Build the API client.",
                    " */",
                    "export function buildClient(): void {}",
                ].join("\n"),
            },
            {
                code: [
                    "/**",
                    " * Public API shape.",
                    " */",
                    "export interface PublicApi {",
                    "    run(): void;",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
