#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const packageJsonUrl = new URL("../package.json", import.meta.url);
const esmEntrypointUrl = new URL("../dist/plugin.js", import.meta.url);
const cjsEntrypointUrl = new URL("../dist/plugin.cjs", import.meta.url);

/**
 * Read and validate the package version used as the built-entrypoint source of
 * truth.
 *
 * @returns {Promise<string>}
 */
const readPackageVersion = async () => {
    const packageJsonText = await readFile(packageJsonUrl, "utf8");
    /** @type {unknown} */
    const packageJson = JSON.parse(packageJsonText);

    if (typeof packageJson !== "object" || packageJson === null) {
        throw new TypeError("Expected package.json to contain an object.");
    }

    const version = Reflect.get(packageJson, "version");

    if (typeof version !== "string" || version.trim().length === 0) {
        throw new TypeError(
            "Expected package.json to contain a nonblank string version."
        );
    }

    return version;
};

/**
 * Read the public plugin metadata version without trusting the module shape.
 *
 * @param {unknown} plugin
 * @param {string} format
 *
 * @returns {string}
 */
const readPluginVersion = (plugin, format) => {
    if (typeof plugin !== "object" || plugin === null) {
        throw new TypeError(
            `Expected the ${format} entrypoint to export an object.`
        );
    }

    const metadata = Reflect.get(plugin, "meta");

    if (typeof metadata !== "object" || metadata === null) {
        throw new TypeError(
            `Expected the ${format} entrypoint to expose plugin metadata.`
        );
    }

    const version = Reflect.get(metadata, "version");

    if (typeof version !== "string" || version.trim().length === 0) {
        throw new TypeError(
            `Expected the ${format} entrypoint metadata to contain a nonblank version.`
        );
    }

    return version;
};

const packageVersion = await readPackageVersion();
const esmModule = await import(esmEntrypointUrl.href);
const require = createRequire(import.meta.url);
/** @type {unknown} */
const cjsPlugin = require(fileURLToPath(cjsEntrypointUrl));

const esmVersion = readPluginVersion(esmModule.default, "ESM");
const cjsVersion = readPluginVersion(cjsPlugin, "CommonJS");

for (const [format, version] of [
    ["ESM", esmVersion],
    ["CommonJS", cjsVersion],
]) {
    if (version !== packageVersion) {
        throw new Error(
            `${format} plugin metadata version ${version} does not match package.json version ${packageVersion}.`
        );
    }
}

console.log(
    `Verified ESM and CommonJS plugin metadata at version ${packageVersion}.`
);
