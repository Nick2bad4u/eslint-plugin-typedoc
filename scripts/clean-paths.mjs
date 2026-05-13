#!/usr/bin/env node

import { globSync, rmSync } from "node:fs";

const envVariablePattern = /%([^%]+)%/gv;
const globMagicCharacters = new Set([
    "*",
    "?",
    "[",
    "]",
    "{",
    "}",
]);

/**
 * @param {string} value
 *
 * @returns {string}
 */
const expandEnvironmentVariables = (value) =>
    value.replaceAll(envVariablePattern, (_match, variableName) => {
        const envValue = process.env[variableName];

        return typeof envValue === "string" ? envValue : "";
    });

/**
 * @param {readonly string[]} values
 *
 * @returns {string[]}
 */
const unique = (values) => [...new Set(values)];

/**
 * @param {string} value
 *
 * @returns {boolean}
 */
const hasGlobMagic = (value) =>
    [...value].some((character) => globMagicCharacters.has(character));

/**
 * @param {string} pattern
 *
 * @returns {string[]}
 */
const toMatchedPaths = (pattern) => {
    const expandedPattern = expandEnvironmentVariables(pattern);

    if (hasGlobMagic(expandedPattern)) {
        return globSync(expandedPattern);
    }

    return [expandedPattern];
};

const patterns = process.argv.slice(2);
const matchedPaths = unique(
    patterns.flatMap((pattern) => toMatchedPaths(pattern))
);

for (const matchedPath of matchedPaths) {
    rmSync(matchedPath, {
        force: true,
        recursive: true,
    });
}
