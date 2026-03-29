/**
 * @packageDocumentation
 * Snapshot coverage for stable public plugin contracts.
 */
import type { UnknownRecord } from "type-fest";

import { objectEntries } from "ts-extras";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

interface ParserOptionsSnapshot {
    ecmaVersion: null | string;
    projectService: boolean;
    sourceType: null | string;
}

/** Plugin config type inferred from public plugin export. */
type PluginConfig =
    (typeof typefestPlugin)["configs"][keyof (typeof typefestPlugin)["configs"]];

interface PresetContractSnapshot {
    configKey: string;
    parserOptions: ParserOptionsSnapshot;
    presetName: null | string;
    ruleCount: number;
    ruleIds: readonly string[];
}

/** Guard dynamic values into object records. */
const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

/**
 * Normalize parser options into a stable and snapshot-friendly shape.
 *
 * @param config - Public plugin preset config.
 *
 * @returns Stable parser option summary for snapshots.
 */
const getParserOptionsSnapshot = (
    config: Readonly<PluginConfig>
): ParserOptionsSnapshot => {
    const parserOptions = config.languageOptions?.["parserOptions"];

    if (!isRecord(parserOptions)) {
        return {
            ecmaVersion: null,
            projectService: false,
            sourceType: null,
        };
    }

    const ecmaVersion = parserOptions["ecmaVersion"];
    const sourceType = parserOptions["sourceType"];
    const projectService = parserOptions["projectService"];

    return {
        ecmaVersion: typeof ecmaVersion === "string" ? ecmaVersion : null,
        projectService: projectService === true,
        sourceType: typeof sourceType === "string" ? sourceType : null,
    };
};

/**
 * Collect sorted rule IDs for one config preset.
 *
 * @param config - Public plugin preset config.
 *
 * @returns Deterministically sorted qualified rule IDs.
 */
const getSortedRuleIds = (config: Readonly<PluginConfig>): readonly string[] =>
    Object.keys(config.rules).toSorted((left, right) =>
        left.localeCompare(right)
    );

/**
 * Build a stable snapshot payload for every exported preset.
 *
 * @returns Normalized preset contract snapshots sorted by config key.
 */
const getPresetContractSnapshot = (): readonly PresetContractSnapshot[] =>
    objectEntries(typefestPlugin.configs)
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([configKey, config]) => {
            const presetName = config.name;

            return {
                configKey,
                parserOptions: getParserOptionsSnapshot(config),
                presetName: typeof presetName === "string" ? presetName : null,
                ruleCount: getSortedRuleIds(config).length,
                ruleIds: getSortedRuleIds(config),
            };
        });

describe("plugin contract snapshots", () => {
    it("keeps stable exported rule names", () => {
        expect({
            ruleCount: Object.keys(typefestPlugin.rules).length,
            ruleNames: Object.keys(typefestPlugin.rules).toSorted(
                (left, right) => left.localeCompare(right)
            ),
        }).toMatchSnapshot();
    });

    it("keeps stable preset contract matrix", () => {
        expect(getPresetContractSnapshot()).toMatchSnapshot();
    });

    it("keeps stable plugin identity metadata", () => {
        expect({
            name: typefestPlugin.meta.name,
            namespace: typefestPlugin.meta.namespace,
        }).toMatchInlineSnapshot(`
            {
              "name": "eslint-plugin-typefest",
              "namespace": "typefest",
            }
        `);
    });
});
