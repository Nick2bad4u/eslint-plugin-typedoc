/**
 * @file Remark lint plugin enforcing canonical H2 heading order for helper
 *   docs.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** @typedef {import("mdast").Heading} Heading */
/** @typedef {import("mdast").Root} Root */
/** @typedef {import("unist").Node} Node */
/** @typedef {import("vfile").VFile} VFile */
/** @typedef {{ name?: unknown }} PackageMetadata */
/** @typedef {boolean | undefined} HeadingToggle */

/**
 * @typedef {{
 *     headings?: Partial<Record<string, HeadingToggle>>;
 *     helperDocPathPattern?: RegExp;
 *     requirePackageDocumentation?: boolean;
 *     requirePackageDocumentationLabel?: boolean;
 *     requireRuleCatalogId?: boolean;
 *     packageDocumentationLabelPattern?: RegExp;
 *     ruleCatalogIdLinePattern?: RegExp;
 *     ruleNamespaceAliases?: readonly string[];
 * }} RemarkLintRuleDocHeadingsOptions
 */

const canonicalHeadingDefinitions = [
    {
        heading: "Targeted pattern scope",
        key: "targetedPatternScope",
        requiredByDefault: true,
    },
    {
        heading: "What this rule reports",
        key: "whatThisRuleReports",
        requiredByDefault: true,
    },
    {
        heading: "Why this rule exists",
        key: "whyThisRuleExists",
        requiredByDefault: true,
    },
    { heading: "❌ Incorrect", key: "incorrect", requiredByDefault: true },
    { heading: "✅ Correct", key: "correct", requiredByDefault: true },
    { heading: "Deprecated", key: "deprecated", requiredByDefault: false },
    {
        heading: "Behavior and migration notes",
        key: "behaviorAndMigrationNotes",
        requiredByDefault: false,
    },
    {
        heading: "Additional examples",
        key: "additionalExamples",
        requiredByDefault: false,
    },
    {
        heading: "ESLint flat config example",
        key: "eslintFlatConfigExample",
        requiredByDefault: false,
    },
    {
        heading: "When not to use it",
        key: "whenNotToUseIt",
        requiredByDefault: false,
    },
    {
        heading: "Package documentation",
        key: "packageDocumentation",
        requiredByDefault: false,
    },
    {
        heading: "Further reading",
        key: "furtherReading",
        requiredByDefault: true,
    },
    {
        heading: "Adoption resources",
        key: "adoptionResources",
        requiredByDefault: false,
    },
];

const optionalDetailHeadingDefinitions = [
    { heading: "Matched patterns", key: "matchedPatterns" },
    { heading: "Detection boundaries", key: "detectionBoundaries" },
];

const canonicalHeadingOrder = canonicalHeadingDefinitions.map(
    (definition) => definition.heading
);

const canonicalHeadingDefinitionsByTitle = new Map(
    canonicalHeadingDefinitions.map((definition) => [
        definition.heading,
        definition,
    ])
);

const optionalDetailHeadingDefinitionsByTitle = new Map(
    optionalDetailHeadingDefinitions.map((definition) => [
        definition.heading,
        definition,
    ])
);

const defaultHeadingToggles = Object.freeze(
    Object.fromEntries(
        [
            ...canonicalHeadingDefinitions,
            ...optionalDetailHeadingDefinitions,
        ].map((definition) => [definition.key, true])
    )
);

const optionalDetailAllowedParentHeadings = new Set([
    "Targeted pattern scope",
    "What this rule reports",
]);

const defaultHelperDocPathPattern =
    /(^|\/)docs\/rules\/(?!overview\.md$|getting-started\.md$|presets\/)[^/]+\.md$/u;
const defaultRuleCatalogIdLinePattern = /^> \*\*Rule catalog ID:\*\* R\d{3}$/u;
const defaultPackageDocumentationLabelPattern =
    /^[^\r\n]+ package documentation:$/mu;
const eslintPluginPackagePrefix = "eslint-plugin-";

const packageMetadataCache = new Map();

/**
 * @param {string} documentPath
 *
 * @returns {PackageMetadata | undefined}
 */
const getNearestPackageMetadata = (documentPath) => {
    const traversedDirectories = [];
    let currentDirectory = dirname(documentPath);

    while (true) {
        traversedDirectories.push(currentDirectory);

        if (packageMetadataCache.has(currentDirectory)) {
            const cachedPackageMetadata =
                packageMetadataCache.get(currentDirectory);

            for (const traversedDirectory of traversedDirectories) {
                packageMetadataCache.set(
                    traversedDirectory,
                    cachedPackageMetadata
                );
            }

            return cachedPackageMetadata;
        }

        const packageJsonPath = join(currentDirectory, "package.json");

        if (existsSync(packageJsonPath)) {
            let packageMetadata;

            try {
                packageMetadata = /** @type {PackageMetadata} */ (
                    JSON.parse(readFileSync(packageJsonPath, "utf8"))
                );
            } catch {
                packageMetadata = undefined;
            }

            for (const traversedDirectory of traversedDirectories) {
                packageMetadataCache.set(traversedDirectory, packageMetadata);
            }

            return packageMetadata;
        }

        const parentDirectory = dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            for (const traversedDirectory of traversedDirectories) {
                packageMetadataCache.set(traversedDirectory, undefined);
            }

            return undefined;
        }

        currentDirectory = parentDirectory;
    }
};

/**
 * @param {unknown} packageName
 *
 * @returns {packageName is string}
 */
const isPackageName = (packageName) => typeof packageName === "string";

/**
 * @param {string} packageName
 *
 * @returns {readonly string[]}
 */
const getRuleNamespaceAliasesFromPackageName = (packageName) => {
    const aliases = new Set();

    if (packageName.startsWith(eslintPluginPackagePrefix)) {
        const pluginName = packageName.slice(eslintPluginPackagePrefix.length);

        if (pluginName !== "") {
            aliases.add(pluginName);
        }

        return [...aliases];
    }

    if (!packageName.startsWith("@")) {
        return [...aliases];
    }

    const packageSeparatorIndex = packageName.indexOf("/");

    if (packageSeparatorIndex === -1) {
        return [...aliases];
    }

    const packageScope = packageName.slice(0, packageSeparatorIndex);
    const scopedPackageName = packageName.slice(packageSeparatorIndex + 1);

    if (!scopedPackageName.startsWith(eslintPluginPackagePrefix)) {
        return [...aliases];
    }

    const pluginName = scopedPackageName.slice(
        eslintPluginPackagePrefix.length
    );

    if (pluginName !== "") {
        aliases.add(pluginName);
        aliases.add(`${packageScope}/${pluginName}`);
    }

    return [...aliases];
};

/**
 * @param {string} fileRuleId
 * @param {readonly string[]} ruleNamespaceAliases
 *
 * @returns {readonly string[]}
 */
const getExpectedH1Titles = (fileRuleId, ruleNamespaceAliases) => {
    const expectedH1Titles = new Set([fileRuleId]);

    if (fileRuleId.startsWith("typescript-")) {
        expectedH1Titles.add(`typescript/${fileRuleId.slice(11)}`);
    }

    for (const ruleNamespaceAlias of ruleNamespaceAliases) {
        expectedH1Titles.add(`${ruleNamespaceAlias}/${fileRuleId}`);
    }

    return [...expectedH1Titles];
};

/**
 * @param {string} path
 *
 * @returns {string}
 */
const normalizePath = (path) => path.replaceAll("\\", "/");

/**
 * @param {unknown} value
 *
 * @returns {value is { value: string }}
 */
const hasValue = (value) =>
    typeof value === "object" && value !== null && "value" in value;

/**
 * @param {unknown} value
 *
 * @returns {value is { children: unknown[] }}
 */
const hasChildren = (value) =>
    typeof value === "object" && value !== null && "children" in value;

/**
 * @param {unknown} node
 *
 * @returns {string}
 */
const getNodeText = (node) => {
    if (hasValue(node) && typeof node.value === "string") {
        return node.value;
    }

    if (hasChildren(node) && Array.isArray(node.children)) {
        return node.children.map((child) => getNodeText(child)).join("");
    }

    return "";
};

/**
 * @param {unknown} value
 *
 * @returns {value is Root}
 */
const isRootNode = (value) =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "root" &&
    "children" in value &&
    Array.isArray(value.children);

/**
 * @param {unknown} node
 *
 * @returns {node is Heading}
 */
const isHeadingNode = (node) =>
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    node.type === "heading" &&
    "depth" in node;

/**
 * @param {VFile} file
 * @param {Heading} sectionHeading
 * @param {Heading | undefined} nextSectionHeading
 *
 * @returns {string}
 */
const getSectionContent = (file, sectionHeading, nextSectionHeading) => {
    const sectionStartOffset = sectionHeading.position?.end?.offset;
    const nextSectionOffset = nextSectionHeading?.position?.start?.offset;
    const markdownStartOffset =
        typeof sectionStartOffset === "number" ? sectionStartOffset : 0;
    const markdownEndOffset =
        typeof nextSectionOffset === "number"
            ? nextSectionOffset
            : String(file).length;

    return String(file).slice(markdownStartOffset, markdownEndOffset);
};

/**
 * @param {Root} tree
 * @param {1 | 2} depth
 *
 * @returns {readonly Heading[]}
 */
const getHeadingsByDepth = (tree, depth) =>
    tree.children.filter(
        /**
         * @param {unknown} node
         *
         * @returns {node is Heading}
         */
        (node) =>
            typeof node === "object" &&
            node !== null &&
            "type" in node &&
            node.type === "heading" &&
            "depth" in node &&
            node.depth === depth
    );

/**
 * Enforce canonical helper-doc heading schema.
 *
 * @param {RemarkLintRuleDocHeadingsOptions} [options]
 *
 * @returns {(tree: Node, file: VFile) => void}
 */
export default function remarkLintRuleDocHeadings(options = {}) {
    const headingToggles = {
        ...defaultHeadingToggles,
        ...(options.headings ?? {}),
    };
    const helperDocPathPattern =
        options.helperDocPathPattern ?? defaultHelperDocPathPattern;
    const requirePackageDocumentation =
        options.requirePackageDocumentation ?? false;
    const requirePackageDocumentationLabel =
        options.requirePackageDocumentationLabel ??
        options.packageDocumentationLabelPattern !== undefined;
    const requireRuleCatalogId =
        options.requireRuleCatalogId ??
        options.ruleCatalogIdLinePattern !== undefined;
    const packageDocumentationLabelPattern =
        options.packageDocumentationLabelPattern ??
        defaultPackageDocumentationLabelPattern;
    const ruleCatalogIdLinePattern =
        options.ruleCatalogIdLinePattern ?? defaultRuleCatalogIdLinePattern;
    /** @param {keyof typeof defaultHeadingToggles} headingKey */
    const isHeadingEnabled = (headingKey) =>
        headingToggles[headingKey] !== false;
    const enabledCanonicalHeadingOrder = canonicalHeadingDefinitions
        .filter((definition) => isHeadingEnabled(definition.key))
        .map((definition) => definition.heading);
    const headingOrderIndex = new Map(
        enabledCanonicalHeadingOrder.map((heading, index) => [heading, index])
    );
    const optionalDetailHeadings = new Set(
        optionalDetailHeadingDefinitions
            .filter((definition) => isHeadingEnabled(definition.key))
            .map((definition) => definition.heading)
    );
    const requiredCanonicalHeadings = canonicalHeadingDefinitions.filter(
        (definition) =>
            isHeadingEnabled(definition.key) && definition.requiredByDefault
    );

    return (tree, file) => {
        if (typeof file.path !== "string") {
            return;
        }

        if (!isRootNode(tree)) {
            return;
        }

        const normalizedPath = normalizePath(file.path);

        if (!helperDocPathPattern.test(normalizedPath)) {
            return;
        }

        const h1Headings = getHeadingsByDepth(tree, 1);
        const h2Headings = getHeadingsByDepth(tree, 2);
        const headingNames = h2Headings.map((heading) =>
            getNodeText(heading).trim()
        );

        const expectedRuleTitle = normalizedPath
            .split("/")
            .at(-1)
            ?.replace(/\.md$/u, "");
        const packageMetadata = getNearestPackageMetadata(file.path);
        const packageRuleNamespaceAliases = isPackageName(packageMetadata?.name)
            ? getRuleNamespaceAliasesFromPackageName(packageMetadata.name)
            : [];
        const ruleNamespaceAliases = [
            ...new Set([
                ...packageRuleNamespaceAliases,
                ...(options.ruleNamespaceAliases ?? []),
            ]),
        ];

        if (h1Headings.length !== 1) {
            file.message(
                "Helper docs must contain exactly one H1 heading.",
                h1Headings[0],
                "remark-lint:rule-doc-headings:h1-count"
            );
        }

        if (h1Headings.length === 1 && typeof expectedRuleTitle === "string") {
            const actualTitle = getNodeText(h1Headings[0]).trim();
            const expectedH1Titles = getExpectedH1Titles(
                expectedRuleTitle,
                ruleNamespaceAliases
            );

            if (!expectedH1Titles.includes(actualTitle)) {
                file.message(
                    `H1 heading must match one of: ${expectedH1Titles.map((title) => `\`${title}\``).join(", ")}.`,
                    h1Headings[0],
                    "remark-lint:rule-doc-headings:h1-title"
                );
            }
        }

        const seenHeadings = new Set();

        for (const [index, headingName] of headingNames.entries()) {
            const headingDefinition =
                canonicalHeadingDefinitionsByTitle.get(headingName);

            if (
                headingDefinition !== undefined &&
                !isHeadingEnabled(headingDefinition.key)
            ) {
                continue;
            }

            if (seenHeadings.has(headingName)) {
                file.message(
                    `Duplicate H2 heading \`${headingName}\` is not allowed.`,
                    h2Headings[index],
                    "remark-lint:rule-doc-headings:duplicate-heading"
                );
                continue;
            }

            seenHeadings.add(headingName);
        }

        let currentH2HeadingName;
        let detectionBoundariesHeadingIndex = -1;
        let matchedPatternsHeadingIndex = -1;

        for (const [index, node] of tree.children.entries()) {
            if (!isHeadingNode(node)) {
                continue;
            }

            const headingName = getNodeText(node).trim();
            const detailHeadingDefinition =
                optionalDetailHeadingDefinitionsByTitle.get(headingName);

            if (node.depth === 2) {
                currentH2HeadingName = headingName;
                continue;
            }

            if (
                node.depth !== 3 ||
                detailHeadingDefinition === undefined ||
                !isHeadingEnabled(detailHeadingDefinition.key) ||
                !optionalDetailHeadings.has(headingName)
            ) {
                continue;
            }

            if (
                currentH2HeadingName === undefined ||
                !optionalDetailAllowedParentHeadings.has(currentH2HeadingName)
            ) {
                file.message(
                    `\`### ${headingName}\` must be placed under \`## Targeted pattern scope\` or \`## What this rule reports\`.`,
                    node,
                    "remark-lint:rule-doc-headings:detail-heading-parent"
                );
            }

            if (headingName === "Matched patterns") {
                matchedPatternsHeadingIndex = index;
            }

            if (headingName === "Detection boundaries") {
                detectionBoundariesHeadingIndex = index;
            }
        }

        if (
            detectionBoundariesHeadingIndex !== -1 &&
            matchedPatternsHeadingIndex !== -1 &&
            detectionBoundariesHeadingIndex < matchedPatternsHeadingIndex
        ) {
            const detectionBoundariesHeading =
                tree.children[detectionBoundariesHeadingIndex];

            file.message(
                "`### Detection boundaries` must appear after `### Matched patterns` when both are present.",
                detectionBoundariesHeading,
                "remark-lint:rule-doc-headings:detail-heading-order"
            );
        }

        let lastOrder = -1;

        for (const [index, headingName] of headingNames.entries()) {
            const headingDefinition =
                canonicalHeadingDefinitionsByTitle.get(headingName);

            if (
                headingDefinition !== undefined &&
                !isHeadingEnabled(headingDefinition.key)
            ) {
                continue;
            }

            const headingOrder = headingOrderIndex.get(headingName);
            const headingNode = h2Headings[index];

            if (headingOrder === undefined) {
                file.message(
                    `Unexpected H2 heading \`${headingName}\`. Allowed helper-doc headings: ${canonicalHeadingOrder.join(", ")}.`,
                    headingNode,
                    "remark-lint:rule-doc-headings:unknown-heading"
                );
                continue;
            }

            if (headingOrder < lastOrder) {
                file.message(
                    `Heading \`${headingName}\` is out of order. Follow the canonical helper-doc sequence.`,
                    headingNode,
                    "remark-lint:rule-doc-headings:order"
                );
            }

            lastOrder = headingOrder;
        }

        const packageDocumentationIndex = headingNames.indexOf(
            "Package documentation"
        );
        const deprecatedSectionIndex = headingNames.indexOf("Deprecated");
        const furtherReadingIndex = headingNames.indexOf("Further reading");
        const packageDocumentationEnabled = isHeadingEnabled(
            "packageDocumentation"
        );
        const furtherReadingEnabled = isHeadingEnabled("furtherReading");
        const deprecatedEnabled = isHeadingEnabled("deprecated");
        const targetedPatternScopeEnabled = isHeadingEnabled(
            "targetedPatternScope"
        );
        const whatThisRuleReportsEnabled = isHeadingEnabled(
            "whatThisRuleReports"
        );

        for (const requiredHeading of requiredCanonicalHeadings) {
            if (!headingNames.includes(requiredHeading.heading)) {
                file.message(
                    `Missing required H2 heading \`${requiredHeading.heading}\`.`,
                    undefined,
                    "remark-lint:rule-doc-headings:missing-required"
                );
            }
        }

        const targetedPatternScopeIndex = headingNames.indexOf(
            "Targeted pattern scope"
        );
        const whatThisRuleReportsIndex = headingNames.indexOf(
            "What this rule reports"
        );
        /** @param {number} index */
        const getH2HeadingNodeAt = (index) =>
            index >= 0 && index < h2Headings.length
                ? h2Headings[index]
                : undefined;
        const firstH2HeadingNode = h2Headings[0];

        if (targetedPatternScopeEnabled && targetedPatternScopeIndex !== 0) {
            const targetedPatternScopeHeading =
                getH2HeadingNodeAt(targetedPatternScopeIndex) ??
                getH2HeadingNodeAt(whatThisRuleReportsIndex) ??
                firstH2HeadingNode;

            file.message(
                "`## Targeted pattern scope` must be the first H2 section.",
                targetedPatternScopeHeading,
                "remark-lint:rule-doc-headings:targeted-scope-position"
            );
        }

        if (
            targetedPatternScopeEnabled &&
            whatThisRuleReportsEnabled &&
            whatThisRuleReportsIndex !== targetedPatternScopeIndex + 1
        ) {
            const targetedPatternScopeHeading =
                getH2HeadingNodeAt(whatThisRuleReportsIndex) ??
                getH2HeadingNodeAt(targetedPatternScopeIndex) ??
                firstH2HeadingNode;

            file.message(
                "`## What this rule reports` must immediately follow `## Targeted pattern scope`.",
                targetedPatternScopeHeading,
                "remark-lint:rule-doc-headings:targeted-scope-adjacent"
            );
        }

        if (
            packageDocumentationEnabled &&
            requirePackageDocumentation &&
            packageDocumentationIndex === -1
        ) {
            file.message(
                "Missing required `## Package documentation` section.",
                undefined,
                "remark-lint:rule-doc-headings:missing-package-docs"
            );
        }

        if (furtherReadingEnabled && furtherReadingIndex === -1) {
            file.message(
                "Missing required `## Further reading` section.",
                undefined,
                "remark-lint:rule-doc-headings:missing-further-reading"
            );
        }

        if (deprecatedEnabled && deprecatedSectionIndex !== -1) {
            const deprecatedSectionHeading = h2Headings[deprecatedSectionIndex];

            if (deprecatedSectionHeading === undefined) {
                return;
            }

            const nextH2Heading = h2Headings[deprecatedSectionIndex + 1];
            const deprecatedSectionContent = getSectionContent(
                file,
                deprecatedSectionHeading,
                nextH2Heading
            );

            if (!/\[[^\]]+\]\([^\)]+\)/u.test(deprecatedSectionContent)) {
                file.message(
                    "`## Deprecated` should include a link to the recommended replacement rule or package.",
                    deprecatedSectionHeading,
                    "remark-lint:rule-doc-headings:deprecated-replacement-link"
                );
            }
        }

        if (
            packageDocumentationEnabled &&
            furtherReadingEnabled &&
            packageDocumentationIndex !== -1 &&
            furtherReadingIndex !== -1 &&
            packageDocumentationIndex !== furtherReadingIndex - 1
        ) {
            const packageHeadingNode = h2Headings[packageDocumentationIndex];

            file.message(
                "`## Package documentation` must appear immediately before `## Further reading`.",
                packageHeadingNode,
                "remark-lint:rule-doc-headings:package-placement"
            );
        }

        if (
            packageDocumentationEnabled &&
            requirePackageDocumentationLabel &&
            packageDocumentationIndex !== -1
        ) {
            const packageDocumentationHeading =
                h2Headings[packageDocumentationIndex];

            if (packageDocumentationHeading !== undefined) {
                const nextPackageSectionHeading =
                    h2Headings[packageDocumentationIndex + 1];
                const packageDocumentationContent = getSectionContent(
                    file,
                    packageDocumentationHeading,
                    nextPackageSectionHeading
                );

                if (
                    !packageDocumentationLabelPattern.test(
                        packageDocumentationContent
                    )
                ) {
                    file.message(
                        "`## Package documentation` must include at least one `<package> package documentation:` label line.",
                        packageDocumentationHeading,
                        "remark-lint:rule-doc-headings:package-docs-label"
                    );
                }
            }
        }

        if (requireRuleCatalogId) {
            const markdownContent = String(file);
            const ruleCatalogIdLines = markdownContent
                .split(/\r?\n/u)
                .map((line) => line.trimEnd())
                .filter((line) => ruleCatalogIdLinePattern.test(line));

            if (ruleCatalogIdLines.length === 0) {
                file.message(
                    "Missing required rule catalog marker line `> **Rule catalog ID:** R###`.",
                    getH2HeadingNodeAt(furtherReadingIndex) ??
                        firstH2HeadingNode,
                    "remark-lint:rule-doc-headings:missing-rule-catalog-id"
                );
            }

            if (ruleCatalogIdLines.length > 1) {
                file.message(
                    "Rule docs must contain exactly one `> **Rule catalog ID:** R###` marker line.",
                    getH2HeadingNodeAt(furtherReadingIndex) ??
                        firstH2HeadingNode,
                    "remark-lint:rule-doc-headings:duplicate-rule-catalog-id"
                );
            }
        }
    };
}
