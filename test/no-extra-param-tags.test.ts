import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("no-extra-param-tags", getPluginRule("no-extra-param-tags"), {
    invalid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @param extra No longer exists.",
                " * @returns Sum.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
            errors: [{ messageId: "extraParamTags" }],
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Add two numbers.",
                " * @param left Left value.",
                " * @param right Right value.",
                " * @returns Sum.",
                " */",
                "export function add(left: number, right: number): number {",
                "    return left + right;",
                "}",
            ].join("\n"),
        },
        {
            code: [
                "/**",
                " * Normalize options.",
                " * @param options Input options object.",
                " */",
                "export function normalizeOptions({ enabled }: { enabled: boolean }): boolean {",
                "    return enabled;",
                "}",
            ].join("\n"),
        },
    ],
});
