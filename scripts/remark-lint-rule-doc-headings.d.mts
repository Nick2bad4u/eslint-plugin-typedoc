type RuleDocHeadingTransformer = (
    tree: import("unist").Node,
    file: import("vfile").VFile
) => void;

export type RuleDocPrimaryHeadingKey =
    | "targetedPatternScope"
    | "whatThisRuleReports"
    | "whyThisRuleExists"
    | "incorrect"
    | "correct"
    | "deprecated"
    | "behaviorAndMigrationNotes"
    | "additionalExamples"
    | "eslintFlatConfigExample"
    | "whenNotToUseIt"
    | "packageDocumentation"
    | "furtherReading"
    | "adoptionResources";

export type RuleDocDetailHeadingKey = "matchedPatterns" | "detectionBoundaries";

export type RuleDocHeadingKey =
    | RuleDocPrimaryHeadingKey
    | RuleDocDetailHeadingKey;

export interface RemarkLintRuleDocHeadingsOptions {
    /**
     * Toggle individual built-in heading validations on or off.
     *
     * Disabled headings are ignored by presence/order checks, while defaults
     * preserve the current repository behavior.
     */
    readonly headings?: Partial<Record<RuleDocHeadingKey, boolean>>;
    readonly helperDocPathPattern?: RegExp;
    readonly requirePackageDocumentation?: boolean;
    readonly requirePackageDocumentationLabel?: boolean;
    readonly requireRuleCatalogId?: boolean;
    readonly packageDocumentationLabelPattern?: RegExp;
    readonly ruleCatalogIdLinePattern?: RegExp;
    readonly ruleNamespaceAliases?: readonly string[];
}

declare function remarkLintRuleDocHeadings(
    options?: RemarkLintRuleDocHeadingsOptions
): RuleDocHeadingTransformer;

export default remarkLintRuleDocHeadings;
