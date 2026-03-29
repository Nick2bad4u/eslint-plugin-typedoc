/**
 * @packageDocumentation
 * Shared reporting helper for ts-extras global static member-call replacement
 * rules.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { getGlobalIdentifierMemberCall } from "./global-identifier-member-call.js";
import {
    createSafeValueReferenceReplacementFix,
    type ImportedValueAliasMap,
} from "./imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "./module-source.js";
import {
    reportResolvedAutofixOrSuggestionOutcome,
    resolveAutofixOrSuggestionOutcome,
} from "./rule-reporting.js";

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/** Typed rule context shape for global-member call rules. */
type GlobalMemberRuleContext<MessageId extends string> = Readonly<
    TSESLint.RuleContext<MessageId, Readonly<UnknownArray>>
>;

/**
 * Match `GlobalName.memberName(...)` calls that resolve to unshadowed globals
 * and report a standardized ts-extras replacement.
 */
export const reportTsExtrasGlobalMemberCall = <MessageId extends string>({
    canAutofix,
    context,
    importedName,
    imports,
    memberName,
    messageId,
    minimumArgumentCount,
    node,
    objectName,
    reportSuggestion,
    suggestionMessageId,
}: Readonly<{
    canAutofix?: (node: Readonly<TSESTree.CallExpression>) => boolean;
    context: GlobalMemberRuleContext<MessageId>;
    importedName: string;
    imports: DirectNamedValueImports;
    memberName: string;
    messageId: MessageId;
    minimumArgumentCount?: number;
    node: Readonly<TSESTree.CallExpression>;
    objectName: string;
    reportSuggestion?: (
        input: Readonly<{
            fix: TSESLint.ReportFixFunction;
            messageId: MessageId;
            node: Readonly<TSESTree.CallExpression>;
            suggestionMessageId: MessageId;
        }>
    ) => void;
    suggestionMessageId?: MessageId;
}>): void => {
    const globalMemberCall = getGlobalIdentifierMemberCall({
        context,
        memberName,
        node,
        objectName,
    });

    if (globalMemberCall === null) {
        return;
    }

    if (
        typeof minimumArgumentCount === "number" &&
        node.arguments.length < minimumArgumentCount
    ) {
        return;
    }

    const shouldAutofix = canAutofix?.(node) ?? true;
    const fix = createSafeValueReferenceReplacementFix({
        context,
        importedName,
        imports,
        sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
        targetNode: globalMemberCall.callee,
    });

    const outcome = resolveAutofixOrSuggestionOutcome({
        canAutofix: shouldAutofix,
        fix,
    });

    if (outcome.kind === "suggestion" && reportSuggestion !== undefined) {
        reportSuggestion({
            fix: outcome.fix,
            messageId,
            node,
            suggestionMessageId: suggestionMessageId ?? messageId,
        });

        return;
    }

    reportResolvedAutofixOrSuggestionOutcome({
        context,
        messageId,
        node,
        outcome,
        suggestionMessageId: suggestionMessageId ?? messageId,
    });
};
