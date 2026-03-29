/**
 * @packageDocumentation
 * Shared character classification helpers for lightweight parser/token logic.
 */

import { isDefined } from "ts-extras";

const ASCII_DIGIT_ZERO = 48 as const;
const ASCII_DIGIT_NINE = 57 as const;
const ASCII_UPPERCASE_A = 65 as const;
const ASCII_UPPERCASE_Z = 90 as const;
const ASCII_LOWERCASE_A = 97 as const;
const ASCII_LOWERCASE_Z = 122 as const;

const ASCII_TAB = 9 as const;
const ASCII_LINE_FEED = 10 as const;
const ASCII_VERTICAL_TAB = 11 as const;
const ASCII_FORM_FEED = 12 as const;
const ASCII_CARRIAGE_RETURN = 13 as const;
const ASCII_SPACE = 32 as const;
const NO_BREAK_SPACE = 160 as const;
const BYTE_ORDER_MARK = 65_279 as const;
const LINE_SEPARATOR = 8232 as const;
const PARAGRAPH_SEPARATOR = 8233 as const;

const DOLLAR_SIGN = "$" as const;
const UNDERSCORE = "_" as const;

/**
 * Determine whether a single-character string is an ASCII identifier part.
 *
 * @remarks
 * This intentionally mirrors lightweight token checks used by internal string
 * parsers. It does not attempt to model full Unicode ECMAScript identifiers.
 */
export const isAsciiIdentifierPartCharacter = (character: string): boolean => {
    if (character === DOLLAR_SIGN || character === UNDERSCORE) {
        return true;
    }

    if (character.length === 0) {
        return false;
    }

    const codePoint = character.codePointAt(0);

    if (!isDefined(codePoint)) {
        return false;
    }

    return (
        (codePoint >= ASCII_DIGIT_ZERO && codePoint <= ASCII_DIGIT_NINE) ||
        (codePoint >= ASCII_UPPERCASE_A && codePoint <= ASCII_UPPERCASE_Z) ||
        (codePoint >= ASCII_LOWERCASE_A && codePoint <= ASCII_LOWERCASE_Z)
    );
};

/**
 * Determine whether a single-character string should be treated as whitespace
 * in internal import/token parsing helpers.
 */
export const isKnownWhitespaceCharacter = (character: string): boolean => {
    if (character.length === 0) {
        return false;
    }

    const codePoint = character.codePointAt(0);

    if (!isDefined(codePoint)) {
        return false;
    }

    return (
        codePoint === ASCII_TAB ||
        codePoint === ASCII_LINE_FEED ||
        codePoint === ASCII_VERTICAL_TAB ||
        codePoint === ASCII_FORM_FEED ||
        codePoint === ASCII_CARRIAGE_RETURN ||
        codePoint === ASCII_SPACE ||
        codePoint === NO_BREAK_SPACE ||
        codePoint === BYTE_ORDER_MARK ||
        codePoint === LINE_SEPARATOR ||
        codePoint === PARAGRAPH_SEPARATOR
    );
};
