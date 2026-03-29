import { describe, expect, it } from "vitest";

import {
    isAsciiIdentifierPartCharacter,
    isKnownWhitespaceCharacter,
} from "../../src/_internal/text-character";

describe(isAsciiIdentifierPartCharacter, () => {
    it("returns true for ascii letters, digits, dollar sign, and underscore", () => {
        expect(isAsciiIdentifierPartCharacter("a")).toBeTruthy();
        expect(isAsciiIdentifierPartCharacter("Z")).toBeTruthy();
        expect(isAsciiIdentifierPartCharacter("7")).toBeTruthy();
        expect(isAsciiIdentifierPartCharacter("$")).toBeTruthy();
        expect(isAsciiIdentifierPartCharacter("_")).toBeTruthy();
    });

    it("returns false for punctuation, whitespace, and empty strings", () => {
        expect(isAsciiIdentifierPartCharacter(".")).toBeFalsy();
        expect(isAsciiIdentifierPartCharacter("-")).toBeFalsy();
        expect(isAsciiIdentifierPartCharacter(" ")).toBeFalsy();
        expect(isAsciiIdentifierPartCharacter("")).toBeFalsy();
    });

    it("returns false for non-ascii unicode letters", () => {
        expect(isAsciiIdentifierPartCharacter("λ")).toBeFalsy();
        expect(isAsciiIdentifierPartCharacter("你")).toBeFalsy();
    });
});

describe(isKnownWhitespaceCharacter, () => {
    it("returns true for common js whitespace characters", () => {
        expect(isKnownWhitespaceCharacter(" ")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\t")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\n")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\r")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\f")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\v")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\u00A0")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\uFEFF")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\u2028")).toBeTruthy();
        expect(isKnownWhitespaceCharacter("\u2029")).toBeTruthy();
    });

    it("returns false for identifier and punctuation characters", () => {
        expect(isKnownWhitespaceCharacter("a")).toBeFalsy();
        expect(isKnownWhitespaceCharacter("0")).toBeFalsy();
        expect(isKnownWhitespaceCharacter(".")).toBeFalsy();
        expect(isKnownWhitespaceCharacter("")).toBeFalsy();
    });
});
