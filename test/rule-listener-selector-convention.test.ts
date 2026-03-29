import parser from "@typescript-eslint/parser";
/**
 * @packageDocumentation
 * Contract test that discourages broad listeners where selector listeners are
 * trivial and more precise.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const broadListenerNodeKinds = [
    "CallExpression",
    "MemberExpression",
    "TSTypeReference",
] as const;

const selectorConventionExceptionTag = "selector-convention-exception";

type BroadListenerCollectionResult = Readonly<{
    matches: readonly BroadListenerMatch[];
    parseErrorMessage: null | string;
}>;

const isObjectRecord = (
    value: unknown
): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null;

const getPropertyKeyName = (key: unknown): null | string => {
    if (!isObjectRecord(key)) {
        return null;
    }

    if (key["type"] === "Identifier" && typeof key["name"] === "string") {
        return key["name"];
    }

    if (key["type"] === "Literal" && typeof key["value"] === "string") {
        return key["value"];
    }

    return null;
};

const isFunctionLikePropertyValue = (value: unknown): boolean =>
    isObjectRecord(value) &&
    (value["type"] === "ArrowFunctionExpression" ||
        value["type"] === "FunctionExpression");

const pushChildNodes = ({
    nodeRecord,
    nodesToVisit,
}: Readonly<{
    nodeRecord: Readonly<Record<string, unknown>>;
    nodesToVisit: unknown[];
}>): void => {
    for (const value of Object.values(nodeRecord)) {
        if (Array.isArray(value)) {
            for (const arrayEntry of value) {
                nodesToVisit.push(arrayEntry);
            }
        } else if (isObjectRecord(value)) {
            nodesToVisit.push(value);
        }
    }
};

const getBroadListenerMatch = (
    nodeRecord: Readonly<Record<string, unknown>>
): BroadListenerMatch | null => {
    if (nodeRecord["type"] !== "Property") {
        return null;
    }

    const propertyKeyName = getPropertyKeyName(nodeRecord["key"]);

    if (
        typeof propertyKeyName !== "string" ||
        !broadListenerNodeKinds.includes(
            propertyKeyName as (typeof broadListenerNodeKinds)[number]
        ) ||
        (nodeRecord["method"] !== true &&
            !isFunctionLikePropertyValue(nodeRecord["value"]))
    ) {
        return null;
    }

    const nodeLocation = nodeRecord["loc"];

    if (
        !isObjectRecord(nodeLocation) ||
        !isObjectRecord(nodeLocation["start"]) ||
        typeof nodeLocation["start"]["line"] !== "number"
    ) {
        return null;
    }

    return {
        line: nodeLocation["start"]["line"],
        nodeKind: propertyKeyName,
    };
};

const collectBroadListenerMatchesFromSourceText = (
    sourceText: string
): BroadListenerCollectionResult => {
    try {
        const parsed = parser.parseForESLint(sourceText, {
            ecmaVersion: "latest",
            loc: true,
            range: false,
            sourceType: "module",
        });
        const matches: BroadListenerMatch[] = [];
        const nodesToVisit: unknown[] = [parsed.ast];

        while (nodesToVisit.length > 0) {
            const currentNode = nodesToVisit.pop();

            if (isObjectRecord(currentNode)) {
                const broadListenerMatch = getBroadListenerMatch(currentNode);

                if (broadListenerMatch !== null) {
                    matches.push(broadListenerMatch);
                }

                pushChildNodes({
                    nodeRecord: currentNode,
                    nodesToVisit,
                });
            }
        }

        return {
            matches,
            parseErrorMessage: null,
        };
    } catch (error_) {
        const parseErrorMessage =
            error_ instanceof Error ? error_.message : String(error_);

        return {
            matches: [],
            parseErrorMessage,
        };
    }
};

type BroadListenerMatch = Readonly<{
    line: number;
    nodeKind: string;
}>;

const getRuleSourceFilePaths = (): readonly string[] => {
    const rulesDirectory = path.join(process.cwd(), "src", "rules");

    return fs
        .readdirSync(rulesDirectory)
        .filter((entry) => entry.endsWith(".ts"))
        .map((entry) => path.join(rulesDirectory, entry))
        .toSorted((left, right) => left.localeCompare(right));
};

const getBroadListenerViolationsForFile = (
    filePath: string
): readonly string[] => {
    const sourceText = fs.readFileSync(filePath, "utf8");
    const sourceLines = sourceText.split(/\r?\n/v);
    const relativeFilePath = path
        .relative(process.cwd(), filePath)
        .replaceAll("\\\\", "/");

    const violations: string[] = [];

    const broadListenerCollectionResult =
        collectBroadListenerMatchesFromSourceText(sourceText);

    if (broadListenerCollectionResult.parseErrorMessage !== null) {
        violations.push(
            `${relativeFilePath}:1 parser failed while validating selector convention contract: ${broadListenerCollectionResult.parseErrorMessage}`
        );

        return violations;
    }

    for (const broadListenerMatch of broadListenerCollectionResult.matches) {
        const previousLine = sourceLines[broadListenerMatch.line - 2] ?? "";

        if (!previousLine.includes(selectorConventionExceptionTag)) {
            violations.push(
                `${relativeFilePath}:${broadListenerMatch.line} uses broad '${broadListenerMatch.nodeKind}(...)' listener method; prefer selector keys like '${broadListenerMatch.nodeKind}[...]'. If broad matching is required, add a previous-line comment containing '${selectorConventionExceptionTag}' with a reason.`
            );
        }
    }

    return violations;
};

describe("rule listener selector conventions", () => {
    it("avoids broad listeners for trivially selector-safe node kinds", () => {
        const violations = getRuleSourceFilePaths().flatMap((filePath) =>
            getBroadListenerViolationsForFile(filePath)
        );

        expect(violations).toStrictEqual([]);
    });
});
