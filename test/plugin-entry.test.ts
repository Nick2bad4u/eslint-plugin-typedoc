/**
 * @packageDocumentation
 * Vitest coverage for `plugin-entry.test` behavior.
 */
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { typefestConfigNames } from "../src/_internal/typefest-config-references";
import typefestPlugin from "../src/plugin";

const requireFromTestModule = createRequire(import.meta.url);
const packageJson = requireFromTestModule("../package.json") as {
    version: string;
};
const expectedPluginVersion = packageJson.version;

const expectedConfigRegistryShape = expect.objectContaining(
    Object.fromEntries(
        [...typefestConfigNames].map((configName) => [
            configName,
            expect.any(Object),
        ])
    )
);

const expectedRuleRegistryShape = expect.objectContaining({
    "prefer-ts-extras-as-writable": expect.any(Object),
    "prefer-ts-extras-is-defined": expect.any(Object),
    "prefer-ts-extras-is-equal-type": expect.any(Object),
    "prefer-ts-extras-is-present": expect.any(Object),
    "prefer-ts-extras-not": expect.any(Object),
    "prefer-ts-extras-safe-cast-to": expect.any(Object),
    "prefer-type-fest-conditional-pick": expect.any(Object),
    "prefer-type-fest-if": expect.any(Object),
    "prefer-type-fest-iterable-element": expect.any(Object),
    "prefer-type-fest-json-array": expect.any(Object),
    "prefer-type-fest-json-primitive": expect.any(Object),
    "prefer-type-fest-keys-of-union": expect.any(Object),
    "prefer-type-fest-omit-index-signature": expect.any(Object),
    "prefer-type-fest-require-all-or-none": expect.any(Object),
    "prefer-type-fest-require-at-least-one": expect.any(Object),
    "prefer-type-fest-require-exactly-one": expect.any(Object),
    "prefer-type-fest-require-one-or-none": expect.any(Object),
    "prefer-type-fest-schema": expect.any(Object),
    "prefer-type-fest-set-non-nullable": expect.any(Object),
    "prefer-type-fest-set-optional": expect.any(Object),
    "prefer-type-fest-set-readonly": expect.any(Object),
    "prefer-type-fest-set-required": expect.any(Object),
    "prefer-type-fest-simplify": expect.any(Object),
    "prefer-type-fest-tuple-of": expect.any(Object),
    "prefer-type-fest-unwrap-tagged": expect.any(Object),
});

describe("plugin entry module", () => {
    it("exports default plugin object with rule and config registries", () => {
        expect(typefestPlugin).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.any(Object),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );

        expect(typefestPlugin.meta).toEqual(
            expect.objectContaining({
                name: "eslint-plugin-typefest",
                namespace: "typefest",
                version: expectedPluginVersion,
            })
        );
    });

    it("exposes critical presets and latest rule registrations", () => {
        expect(typefestPlugin.configs).toEqual(expectedConfigRegistryShape);
        expect(typefestPlugin.rules).toEqual(expectedRuleRegistryShape);
    });

    it("exports matching runtime plugin shape from plugin.mjs", async () => {
        const runtimePluginModule = (await import("../plugin.mjs")) as {
            default: unknown;
        };

        expect(runtimePluginModule.default).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.any(Object),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );

        expect(runtimePluginModule.default).toEqual(
            expect.objectContaining({
                meta: expect.objectContaining({
                    name: "eslint-plugin-typefest",
                    namespace: "typefest",
                    version: expectedPluginVersion,
                }),
            })
        );
    });

    it("exports matching runtime plugin shape from dist/plugin.cjs", () => {
        const runtimePlugin = requireFromTestModule("../dist/plugin.cjs") as {
            configs?: unknown;
            meta?: {
                name?: unknown;
                namespace?: unknown;
                version?: unknown;
            };
            processors?: unknown;
            rules?: unknown;
        };

        expect(runtimePlugin).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.any(Object),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );

        expect(runtimePlugin.meta).toEqual(
            expect.objectContaining({
                name: "eslint-plugin-typefest",
                namespace: "typefest",
                version: expectedPluginVersion,
            })
        );
    });

    it("resolves package default export through self-reference ESM import", async () => {
        const packageRuntimeModule =
            (await import("eslint-plugin-typefest")) as {
                default: unknown;
            };

        expect(packageRuntimeModule.default).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.objectContaining({
                    name: "eslint-plugin-typefest",
                    namespace: "typefest",
                    version: expectedPluginVersion,
                }),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );
    });

    it("resolves package default export through self-reference CJS require", () => {
        const packageRuntimePlugin = requireFromTestModule(
            "eslint-plugin-typefest"
        ) as {
            configs?: unknown;
            meta?: {
                name?: unknown;
                namespace?: unknown;
                version?: unknown;
            };
            processors?: unknown;
            rules?: unknown;
        };

        expect(packageRuntimePlugin).toEqual(
            expect.objectContaining({
                configs: expect.any(Object),
                meta: expect.objectContaining({
                    name: "eslint-plugin-typefest",
                    namespace: "typefest",
                    version: expectedPluginVersion,
                }),
                processors: expect.any(Object),
                rules: expect.any(Object),
            })
        );
    });
});
