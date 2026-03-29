import {
    createTypeScriptRuleTester,
    getTypedocRule,
} from "./_internal/ruleTester.js";

const ruleTester = createTypeScriptRuleTester();

ruleTester.run("no-typedoc-tag-alias", getTypedocRule("no-typedoc-tag-alias"), {
    invalid: [
        {
            code: `/**
 * @arg value The input.
 * @return The output.
 */
export function normalize(value: string): string {
    return value.trim();
}`,
            errors: [
                { messageId: "useCanonicalTag" },
                { messageId: "useCanonicalTag" },
            ],
            output: `/**
 * @param value The input.
 * @returns The output.
 */
export function normalize(value: string): string {
    return value.trim();
}`,
        },
    ],
    valid: [
        {
            code: `/**
 * @param value The input.
 * @returns The output.
 */
export function normalize(value: string): string {
    return value.trim();
}`,
        },
    ],
});
