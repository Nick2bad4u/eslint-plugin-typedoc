/**
 * @packageDocumentation
 * Shared text helpers for rule implementations.
 */

/**
 * Escape a string so it can be used in a RegExp source safely.
 *
 * @param value - Raw text fragment.
 *
 * @returns
 *
 * @returnsssssssssss Escaped text safe for dynamic RegExp construction.
 *
 * @returnsssssssss
 *
 * @returnsssssss
 *
 * @returnsssss
 *
 * @returnsss
 */
export const escapeForRegExp = (value: string): string =>
    value.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/**
 * Resolve the predominant line break style for source text.
 *
 * @param sourceText - Full source text.
 *
 * @returns
 *
 * @returnsssssssssss `"\r\n"` when CRLF is detected; otherwise `"\n"`.
 *
 * @returnsssssssss
 *
 * @returnsssssss
 *
 * @returnsssss
 *
 * @returnsss
 */
export const getLineBreak = (sourceText: string): "\n" | "\r\n" =>
    sourceText.includes("\r\n") ? "\r\n" : "\n";
