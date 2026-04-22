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
    .filter((text) => text.trim().length > 0 && !/[\{\}]/v.test(text));

describe(hasMeaningfulTagDescription, () => {
    it("treats formatting-only descriptions as non-meaningful", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(whitespaceTextArbitrary, (whitespaceOnly) => {
                expect(hasMeaningfulTagDescription(whitespaceOnly)).toBeFalsy();
            })
        );

        fc.assert(
            fc.property(
                whitespaceTextArbitrary,
                whitespaceTextArbitrary,
                (leadingWhitespace, trailingWhitespace) => {
                    expect(
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}-${trailingWhitespace}`
                        )
                    ).toBeFalsy();
                }
            )
        );

        fc.assert(
            fc.property(
                whitespaceTextArbitrary,
                tagTypeNameArbitrary,
                whitespaceTextArbitrary,
                (leadingWhitespace, tagTypeName, trailingWhitespace) => {
                    expect(
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}{${tagTypeName}}${trailingWhitespace}`
                        )
                    ).toBeFalsy();
                }
            )
        );
    });

    it("keeps meaningful prose after optional prefix normalization", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                whitespaceTextArbitrary,
                tagTypeNameArbitrary,
                nonEmptyContentArbitrary,
                (leadingWhitespace, tagTypeName, content) => {
                    expect(
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}{${tagTypeName}} ${content}`
                        )
                    ).toBeTruthy();

                    expect(
                        hasMeaningfulTagDescription(
                            `${leadingWhitespace}- ${content}`
                        )
                    ).toBeTruthy();
                }
            )
        );
    });
});
