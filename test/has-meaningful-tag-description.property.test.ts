import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { hasMeaningfulTagDescription } from "../src/_internal/doc-tag-blocks.js";

const whitespaceTextArbitrary = fc
    .array(fc.constantFrom(" ", "\t", "\n", "\r"), { maxLength: 32 })
    .map((fragments) => fragments.join(""));

const nonEmptyContentArbitrary = fc
    .string({ maxLength: 80, minLength: 1 })
    .filter((text) => text.trim().length > 0)
    .map((text) => `text-${text}`);

const tagTypeNameArbitrary = fc
    .string({ maxLength: 20, minLength: 1 })
    .filter(
        (text) =>
            text.trim().length > 0 &&
            !text.trimStart().startsWith("@") &&
            !/[\{\}]/v.test(text)
    );

describe(hasMeaningfulTagDescription, () => {
    it("balances nested JSDoc type annotations", () => {
        expect.hasAssertions();

        expect(hasMeaningfulTagDescription("{Array<{ id: string }>}")).toBe(
            false
        );
        expect(
            hasMeaningfulTagDescription(
                "{Promise<{ id: string }>} Loaded value."
            )
        ).toBe(true);
        expect(
            hasMeaningfulTagDescription('{Record<"}", { id: string }>}')
        ).toBe(false);
        expect(
            hasMeaningfulTagDescription(
                String.raw`{Record<"\"", { id: string }>}`
            )
        ).toBe(false);
        expect(hasMeaningfulTagDescription("{`unterminated }")).toBe(false);
        expect(hasMeaningfulTagDescription("{@link Result}")).toBe(true);
    });

    it("treats formatting-only descriptions as non-meaningful", () => {
        expect.hasAssertions();

        expect(() => {
            fc.assert(
                fc.property(
                    whitespaceTextArbitrary,
                    (whitespaceOnly) =>
                        !hasMeaningfulTagDescription(whitespaceOnly)
                )
            );

            fc.assert(
                fc.property(
                    whitespaceTextArbitrary,
                    whitespaceTextArbitrary,
                    (leadingWhitespace, trailingWhitespace) =>
                        !hasMeaningfulTagDescription(
                            `${leadingWhitespace}-${trailingWhitespace}`
                        )
                )
            );

            fc.assert(
                fc.property(
                    whitespaceTextArbitrary,
                    tagTypeNameArbitrary,
                    whitespaceTextArbitrary,
                    (leadingWhitespace, tagTypeName, trailingWhitespace) =>
                        !hasMeaningfulTagDescription(
                            `${leadingWhitespace}{${tagTypeName}}${trailingWhitespace}`
                        )
                )
            );
        }).not.toThrow();
    });

    it("keeps meaningful prose after optional prefix normalization", () => {
        expect.hasAssertions();

        expect(() => {
            fc.assert(
                fc.property(
                    whitespaceTextArbitrary,
                    tagTypeNameArbitrary,
                    nonEmptyContentArbitrary,
                    (leadingWhitespace, tagTypeName, content) =>
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}{${tagTypeName}} ${content}`
                        ) &&
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}- ${content}`
                        )
                )
            );
        }).not.toThrow();
    });
});
