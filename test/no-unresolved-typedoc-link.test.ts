import {
    createTypeScriptRuleTester,
    getTypedocRule,
} from "./_internal/ruleTester.js";

const ruleTester = createTypeScriptRuleTester();

ruleTester.run(
    "no-unresolved-typedoc-link",
    getTypedocRule("no-unresolved-typedoc-link"),
    {
        invalid: [
            {
                code: `/**
 * Uses {@link MissingType}.
 */
export function run(): void {}`,
                errors: [
                    {
                        messageId: "unresolvedLink",
                        suggestions: [
                            {
                                messageId: "convertLinkToText",
                                output: `/**
 * Uses MissingType.
 */
export function run(): void {}`,
                            },
                        ],
                    },
                ],
            },
            {
                code: `/**
 * Uses {@link MissingType | fallback label}.
 */
export function run(): void {}`,
                errors: [
                    {
                        messageId: "unresolvedLink",
                        suggestions: [
                            {
                                messageId: "convertLinkToText",
                                output: `/**
 * Uses fallback label.
 */
export function run(): void {}`,
                            },
                        ],
                    },
                ],
            },
        ],
        valid: [
            {
                code: `interface KnownType {}

/**
 * Uses {@link KnownType}.
 */
export function run(): void {}`,
            },
            {
                code: `/**
 * External docs {@link https://typedoc.org/}.
 */
export function run(): void {}`,
            },
        ],
    }
);
