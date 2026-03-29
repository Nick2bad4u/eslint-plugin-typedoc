/**
 * @packageDocumentation
 * Shared reporting helper for typed ts-extras identifier-member call rules.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import {
    createMethodToFunctionCallFix,
    type ImportedValueAliasMap,
} from "./imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "./member-call.js";
import { TS_EXTRAS_MODULE_SOURCE } from "./module-source.js";
import {
    reportResolvedAutofixOrSuggestionOutcome,
    resolveAutofixOrSuggestionOutcome,
} from "./rule-reporting.js";

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/** Typed rule context shape for typed member-call rules. */
type TypedMemberCallRuleContext<MessageId extends string> = Readonly<
    TSESLint.RuleContext<MessageId, Readonly<UnknownArray>>
>;

/**
 * Match `<expr>.<memberName>(...)` and report a standardized ts-extras helper
 * replacement when the receiver expression satisfies a caller-provided type
 * predicate.
 */
export const reportTsExtrasTypedMemberCall = <MessageId extends string>({
    canAutofix,
    context,
    importedName,
    imports,
    isMatchingObjectExpression,
    memberName,
    messageId,
    node,
    reportSuggestion,
    suggestionMessageId,
}: Readonly<{
    canAutofix?: (node: Readonly<TSESTree.CallExpression>) => boolean;
    context: TypedMemberCallRuleContext<MessageId>;
    importedName: string;
    imports: DirectNamedValueImports;
    isMatchingObjectExpression: (
        expression: Readonly<TSESTree.Expression>
    ) => boolean;
    memberName: string;
    messageId: MessageId;
    node: Readonly<TSESTree.CallExpression>;
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
    const memberCall = getIdentifierPropertyMemberCall({
        memberName,
        node,
    });

    if (memberCall === null) {
        return;
    }

    if (!isMatchingObjectExpression(memberCall.callee.object)) {
        return;
    }

    const fix = createMethodToFunctionCallFix({
        callNode: node,
        context,
        importedName,
        imports,
        sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
    });

    const shouldAutofix = canAutofix?.(node) ?? true;

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
