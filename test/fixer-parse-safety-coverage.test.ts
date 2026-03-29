/**
 * @packageDocumentation
 * Coverage guard ensuring fixable/suggestion-capable rules retain meaningful
 * parser-backed fast-check parse-safety assertions in their rule test files.
 */

import parser from "@typescript-eslint/parser";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import typefestPlugin from "../src/plugin";

const projectRootPath = process.cwd();
const testsDirectoryPath = path.resolve(projectRootPath, "test");

type CoverageInspection = Readonly<{
    hasGeneratedParseGuardExpectation: boolean;
    observedCallExpressions: ReadonlySet<string>;
}>;

type CoverageMarker = Readonly<{
    description: string;
    matcher: (inspection: CoverageInspection) => boolean;
}>;

type RuleEntry = readonly [RuleName, RuleModule];
type RuleModule = (typeof typefestPlugin.rules)[RuleName];
type RuleName = keyof typeof typefestPlugin.rules;

const ruleRequiresParseSafetyCoverage = (
    ruleModule: Readonly<RuleModule>
): boolean => {
    const meta = ruleModule.meta;

    if (!meta) {
        return false;
    }

    return meta.fixable === "code" || meta.hasSuggestions === true;
};

const collectRuleIdsRequiringParseSafety = (): readonly string[] => {
    const requiringCoverageRuleIds: string[] = [];
    const ruleEntries = Object.entries(typefestPlugin.rules) as RuleEntry[];

    for (const [ruleId, ruleModule] of ruleEntries) {
        if (ruleRequiresParseSafetyCoverage(ruleModule)) {
            requiringCoverageRuleIds.push(ruleId);
        }
    }

    return requiringCoverageRuleIds.toSorted((left, right) =>
        left.localeCompare(right)
    );
};

const getCallExpressionName = (callee: unknown): null | string => {
    if (typeof callee !== "object" || callee === null) {
        return null;
    }

    const calleeRecord = callee as Readonly<Record<string, unknown>>;

    if (
        calleeRecord["type"] === "Identifier" &&
        typeof calleeRecord["name"] === "string"
    ) {
        return calleeRecord["name"];
    }

    if (
        calleeRecord["type"] !== "MemberExpression" ||
        calleeRecord["computed"] !== false
    ) {
        return null;
    }

    const memberObject = calleeRecord["object"];
    const memberProperty = calleeRecord["property"];

    if (
        typeof memberObject !== "object" ||
        memberObject === null ||
        typeof memberProperty !== "object" ||
        memberProperty === null
    ) {
        return null;
    }

    const objectRecord = memberObject as Readonly<Record<string, unknown>>;
    const propertyRecord = memberProperty as Readonly<Record<string, unknown>>;

    if (
        objectRecord["type"] !== "Identifier" ||
        typeof objectRecord["name"] !== "string" ||
        propertyRecord["type"] !== "Identifier" ||
        typeof propertyRecord["name"] !== "string"
    ) {
        return null;
    }

    return `${objectRecord["name"]}.${propertyRecord["name"]}`;
};

const isObjectRecord = (
    value: unknown
): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const enqueueChildNodes = ({
    nodeRecord,
    nodesToVisit,
}: Readonly<{
    nodeRecord: Readonly<Record<string, unknown>>;
    nodesToVisit: unknown[];
}>): void => {
    for (const value of Object.values(nodeRecord)) {
        if (Array.isArray(value)) {
            for (const arrayValue of value) {
                nodesToVisit.push(arrayValue);
            }
        } else if (isObjectRecord(value)) {
            nodesToVisit.push(value);
        }
    }
};

const collectObservedCallExpressionFromNode = ({
    nodeRecord,
    observedCallExpressions,
}: Readonly<{
    nodeRecord: Readonly<Record<string, unknown>>;
    observedCallExpressions: Set<string>;
}>): void => {
    if (nodeRecord["type"] !== "CallExpression") {
        return;
    }

    const callExpressionName = getCallExpressionName(nodeRecord["callee"]);

    if (callExpressionName !== null) {
        observedCallExpressions.add(callExpressionName);
    }
};

const collectObservedCallExpressions = (
    sourceText: string
): ReadonlySet<string> => {
    try {
        const parsed = parser.parseForESLint(sourceText, {
            ecmaVersion: "latest",
            loc: false,
            range: false,
            sourceType: "module",
        });

        const observedCallExpressions = new Set<string>();
        const nodesToVisit: unknown[] = [parsed.ast];

        while (nodesToVisit.length > 0) {
            const currentNode = nodesToVisit.pop();

            if (isObjectRecord(currentNode)) {
                collectObservedCallExpressionFromNode({
                    nodeRecord: currentNode,
                    observedCallExpressions,
                });
                enqueueChildNodes({
                    nodeRecord: currentNode,
                    nodesToVisit,
                });
            }
        }

        return observedCallExpressions;
    } catch {
        return new Set<string>();
    }
};

const containsParseForEslintCall = (rootNode: unknown): boolean => {
    const nodesToVisit: unknown[] = [rootNode];

    while (nodesToVisit.length > 0) {
        const currentNode = nodesToVisit.pop();

        if (isObjectRecord(currentNode)) {
            if (
                currentNode["type"] === "CallExpression" &&
                getCallExpressionName(currentNode["callee"]) ===
                    "parser.parseForESLint"
            ) {
                return true;
            }

            enqueueChildNodes({
                nodeRecord: currentNode,
                nodesToVisit,
            });
        }
    }

    return false;
};

type NamedFunctionBody = Readonly<{
    body: unknown;
    name: string;
}>;

const getNamedFunctionBodyFromNode = (
    nodeRecord: Readonly<Record<string, unknown>>
): NamedFunctionBody | null => {
    if (nodeRecord["type"] === "FunctionDeclaration") {
        const declarationIdentifier = nodeRecord["id"];

        if (
            isObjectRecord(declarationIdentifier) &&
            declarationIdentifier["type"] === "Identifier" &&
            typeof declarationIdentifier["name"] === "string"
        ) {
            return {
                body: nodeRecord["body"],
                name: declarationIdentifier["name"],
            };
        }

        return null;
    }

    if (nodeRecord["type"] !== "VariableDeclarator") {
        return null;
    }

    const declaratorIdentifier = nodeRecord["id"];
    const declaratorInitializer = nodeRecord["init"];

    if (
        isObjectRecord(declaratorIdentifier) &&
        declaratorIdentifier["type"] === "Identifier" &&
        typeof declaratorIdentifier["name"] === "string" &&
        isObjectRecord(declaratorInitializer) &&
        (declaratorInitializer["type"] === "ArrowFunctionExpression" ||
            declaratorInitializer["type"] === "FunctionExpression")
    ) {
        return {
            body: declaratorInitializer["body"],
            name: declaratorIdentifier["name"],
        };
    }

    return null;
};

const collectNamedFunctionBodies = (
    sourceText: string
): ReadonlyMap<string, unknown> => {
    try {
        const parsed = parser.parseForESLint(sourceText, {
            ecmaVersion: "latest",
            loc: false,
            range: false,
            sourceType: "module",
        });
        const namedFunctionBodies = new Map<string, unknown>();
        const nodesToVisit: unknown[] = [parsed.ast];

        while (nodesToVisit.length > 0) {
            const currentNode = nodesToVisit.pop();

            if (isObjectRecord(currentNode)) {
                const namedFunctionBody =
                    getNamedFunctionBodyFromNode(currentNode);

                if (namedFunctionBody !== null) {
                    namedFunctionBodies.set(
                        namedFunctionBody.name,
                        namedFunctionBody.body
                    );
                }

                enqueueChildNodes({
                    nodeRecord: currentNode,
                    nodesToVisit,
                });
            }
        }

        return namedFunctionBodies;
    } catch {
        return new Map<string, unknown>();
    }
};

const containsCallToKnownFunction = ({
    knownFunctionNames,
    rootNode,
}: Readonly<{
    knownFunctionNames: ReadonlySet<string>;
    rootNode: unknown;
}>): boolean => {
    const nodesToVisit: unknown[] = [rootNode];

    while (nodesToVisit.length > 0) {
        const currentNode = nodesToVisit.pop();

        if (isObjectRecord(currentNode)) {
            if (currentNode["type"] === "CallExpression") {
                const callExpressionCallee = currentNode["callee"];

                if (
                    isObjectRecord(callExpressionCallee) &&
                    callExpressionCallee["type"] === "Identifier" &&
                    typeof callExpressionCallee["name"] === "string" &&
                    knownFunctionNames.has(callExpressionCallee["name"])
                ) {
                    return true;
                }
            }

            enqueueChildNodes({
                nodeRecord: currentNode,
                nodesToVisit,
            });
        }
    }

    return false;
};

const collectParseDriverFunctionNames = ({
    namedFunctionBodies,
}: Readonly<{
    namedFunctionBodies: ReadonlyMap<string, unknown>;
}>): ReadonlySet<string> => {
    const parseDriverFunctionNames = new Set<string>();
    let shouldContinue = true;

    while (shouldContinue) {
        shouldContinue = false;

        for (const [functionName, functionBody] of namedFunctionBodies) {
            const shouldTryMarkAsParseDriver =
                !parseDriverFunctionNames.has(functionName);

            if (
                shouldTryMarkAsParseDriver &&
                (containsParseForEslintCall(functionBody) ||
                    containsCallToKnownFunction({
                        knownFunctionNames: parseDriverFunctionNames,
                        rootNode: functionBody,
                    }))
            ) {
                parseDriverFunctionNames.add(functionName);
                shouldContinue = true;
            }
        }
    }

    return parseDriverFunctionNames;
};

const isFastCheckPropertyCallbackWithParseSafety = ({
    callbackCandidate,
    parseDriverFunctionNames,
}: Readonly<{
    callbackCandidate: unknown;
    parseDriverFunctionNames: ReadonlySet<string>;
}>): boolean => {
    if (
        !isObjectRecord(callbackCandidate) ||
        (callbackCandidate["type"] !== "ArrowFunctionExpression" &&
            callbackCandidate["type"] !== "FunctionExpression")
    ) {
        return false;
    }

    return (
        containsParseForEslintCall(callbackCandidate["body"]) ||
        containsCallToKnownFunction({
            knownFunctionNames: parseDriverFunctionNames,
            rootNode: callbackCandidate["body"],
        })
    );
};

const hasFastCheckPropertyParseGuard = (sourceText: string): boolean => {
    try {
        const parsed = parser.parseForESLint(sourceText, {
            ecmaVersion: "latest",
            loc: false,
            range: false,
            sourceType: "module",
        });
        const namedFunctionBodies = collectNamedFunctionBodies(sourceText);
        const parseDriverFunctionNames = collectParseDriverFunctionNames({
            namedFunctionBodies,
        });
        const nodesToVisit: unknown[] = [parsed.ast];

        while (nodesToVisit.length > 0) {
            const currentNode = nodesToVisit.pop();

            if (isObjectRecord(currentNode)) {
                if (
                    currentNode["type"] === "CallExpression" &&
                    getCallExpressionName(currentNode["callee"]) ===
                        "fc.property" &&
                    Array.isArray(currentNode["arguments"]) &&
                    currentNode["arguments"].some((argument) =>
                        isFastCheckPropertyCallbackWithParseSafety({
                            callbackCandidate: argument,
                            parseDriverFunctionNames,
                        })
                    )
                ) {
                    return true;
                }

                enqueueChildNodes({
                    nodeRecord: currentNode,
                    nodesToVisit,
                });
            }
        }
    } catch {
        return false;
    }

    return false;
};

const createCallExpressionCoverageMarker = ({
    callExpressionName,
    description,
}: Readonly<{
    callExpressionName: string;
    description: string;
}>): CoverageMarker => ({
    description,
    matcher: (inspection) =>
        inspection.observedCallExpressions.has(callExpressionName),
});

const coverageMarkers: readonly CoverageMarker[] = [
    createCallExpressionCoverageMarker({
        callExpressionName: "parser.parseForESLint",
        description: "parseForESLint call",
    }),
    createCallExpressionCoverageMarker({
        callExpressionName: "fc.assert",
        description: "fast-check assertion call (fc.assert)",
    }),
    createCallExpressionCoverageMarker({
        callExpressionName: "fc.property",
        description: "fast-check property call (fc.property)",
    }),
    {
        description:
            "parseForESLint invocation reachable inside an fc.property callback",
        matcher: (inspection) => inspection.hasGeneratedParseGuardExpectation,
    },
];

const inspectCoverage = (sourceText: string): CoverageInspection => ({
    hasGeneratedParseGuardExpectation:
        hasFastCheckPropertyParseGuard(sourceText),
    observedCallExpressions: collectObservedCallExpressions(sourceText),
});

const pushRuleIdIfMarkerMissing = ({
    inspection,
    marker,
    missingRuleIds,
    ruleId,
}: Readonly<{
    inspection: CoverageInspection;
    marker: CoverageMarker;
    missingRuleIds: string[];
    ruleId: string;
}>): void => {
    if (!marker.matcher(inspection)) {
        missingRuleIds.push(ruleId);
    }
};

const expectNoMissingRuleCoverage = ({
    markerDescription,
    missingRuleIds,
}: Readonly<{
    markerDescription: string;
    missingRuleIds: readonly string[];
}>): void => {
    expect(
        missingRuleIds,
        `Missing ${markerDescription} coverage for: ${missingRuleIds.toSorted((left, right) => left.localeCompare(right)).join(", ")}`
    ).toStrictEqual([]);
};

describe("fixer parse-safety coverage", () => {
    it("ensures each fixable/suggestion rule test includes parser-backed fast-check parse guards", async () => {
        const ruleIds = collectRuleIdsRequiringParseSafety();

        expect(ruleIds.length).toBeGreaterThan(0);

        const missingTestFiles: string[] = [];
        const missingRuleIdsByMarkerDescription = new Map<string, string[]>(
            coverageMarkers.map((marker) => [marker.description, []])
        );

        for (const ruleId of ruleIds) {
            const ruleTestFilePath = path.join(
                testsDirectoryPath,
                `${ruleId}.test.ts`
            );

            if (existsSync(ruleTestFilePath)) {
                const testSource = await readFile(ruleTestFilePath, "utf8");
                const coverageInspection = inspectCoverage(testSource);

                for (const marker of coverageMarkers) {
                    const missingRuleIds =
                        missingRuleIdsByMarkerDescription.get(
                            marker.description
                        );

                    if (missingRuleIds) {
                        pushRuleIdIfMarkerMissing({
                            inspection: coverageInspection,
                            marker,
                            missingRuleIds,
                            ruleId,
                        });
                    }
                }
            } else {
                missingTestFiles.push(ruleId);
            }
        }

        expectNoMissingRuleCoverage({
            markerDescription: "rule test file",
            missingRuleIds: missingTestFiles,
        });
        for (const marker of coverageMarkers) {
            const missingRuleIds =
                missingRuleIdsByMarkerDescription.get(marker.description) ?? [];

            expectNoMissingRuleCoverage({
                markerDescription: marker.description,
                missingRuleIds,
            });
        }
    });
});
