/**
 * @packageDocumentation
 * Shared reporting helper for ts-extras array-method call replacement rules.
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

/** Typed rule context shape for array-method rule listeners. */
type ArrayMethodRuleContext<MessageId extends string> = Readonly<
    TSESLint.RuleContext<MessageId, Readonly<UnknownArray>>
>;

/** Direct named value imports collection type from shared import helper. */
type DirectNamedValueImports = ImportedValueAliasMap;

/**
 * Match `<arrayExpr>.<method>(...)` and report a standardized ts-extras helper
 * replacement when the receiver is array-like.
 */
export const reportTsExtrasArrayMethodCall = <MessageId extends string>({
    canAutofix,
    context,
    importedName,
    imports,
    isArrayLikeExpression,
    memberName,
    messageId,
    node,
    reportSuggestion,
    suggestionMessageId,
}: Readonly<{
    canAutofix?: (node: Readonly<TSESTree.CallExpression>) => boolean;
    context: ArrayMethodRuleContext<MessageId>;
    importedName: string;
    imports: DirectNamedValueImports;
    isArrayLikeExpression: (
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

    if (!isArrayLikeExpression(memberCall.callee.object)) {
        return;
    }

    const shouldAutofix = canAutofix?.(node) ?? true;
    const fix = createMethodToFunctionCallFix({
        callNode: node,
        context,
        importedName,
        imports,
        sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
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
