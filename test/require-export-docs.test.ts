import {
    createTypeScriptRuleTester,
    getTypedocRule,
} from "./_internal/ruleTester.js";

const ruleTester = createTypeScriptRuleTester();

ruleTester.run("require-export-docs", getTypedocRule("require-export-docs"), {
    invalid: [
        {
            code: `export function parseInput(raw: string): string {
    return raw.trim();
}`,
            errors: [
                {
                    messageId: "missingDocs",
                    suggestions: [
                        {
                            messageId: "addDocTemplate",
                            output: `/**
 * TODO: Document parseInput.
 */
export function parseInput(raw: string): string {
    return raw.trim();
}`,
                        },
                    ],
                },
            ],
        },
    ],
    valid: [
        {
            code: `/**
 * Parse input values.
 */
export function parseInput(raw: string): string {
    return raw.trim();
}`,
        },
        {
            code: `export const VERSION = "1.0.0";`,
            options: [{ includeVariables: false }],
        },
        {
            code: `export default function (): string {
    return "ok";
}`,
            options: [{ allowDefaultExportWithoutDocs: true }],
        },
    ],
});
