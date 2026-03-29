import {
    createTypeScriptRuleTester,
    getTypedocRule,
} from "./_internal/ruleTester.js";

const ruleTester = createTypeScriptRuleTester();

ruleTester.run("enforce-typedoc-tags", getTypedocRule("enforce-typedoc-tags"), {
    invalid: [
        {
            code: `/**
 * Compute score.
 */
export function score(input: string): number {
    return input.length;
}`,
            errors: [{ messageId: "missingTags" }],
            output: `/**
 * Compute score.
 * @param input
 * @returns
 */
export function score(input: string): number {
    return input.length;
}`,
        },
        {
            code: `/** Adds. */
export const add = (left: number, right: number): number => left + right;`,
            errors: [{ messageId: "missingTags" }],
            output: `/** Adds.
 * @param left
 * @param right
 * @returns
 */
export const add = (left: number, right: number): number => left + right;`,
        },
    ],
    valid: [
        {
            code: `/**
 * Compute score.
 * @param input Incoming source.
 * @returns Numeric score.
 */
export function score(input: string): number {
    return input.length;
}`,
        },
        {
            code: `/**
 * Side effect only.
 * @param input Incoming source.
 */
export function logInput(input: string): void {
    console.log(input);
}`,
        },
        {
            code: `/**
 * Compute score.
 * @param input Incoming source.
 */
export function score(input: string): number {
    return input.length;
}`,
            options: [{ requireReturnsTag: false }],
        },
    ],
});
