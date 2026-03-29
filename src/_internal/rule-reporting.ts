/**
 * @packageDocumentation
 * Shared helpers for consistent rule reporting with optional fixes and
 * suggestion fallbacks.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { registerProgramSettingsForContext } from "./plugin-settings.js";
import { omitAutofixFromReportDescriptor } from "./report-adapter.js";

/**
 * Resolution result for optional fix/suggestion reporting.
 */
export type AutofixOrSuggestionOutcome =
    | Readonly<{ fix: TSESLint.ReportFixFunction; kind: "autofix" }>
    | Readonly<{ fix: TSESLint.ReportFixFunction; kind: "suggestion" }>
    | Readonly<{ kind: "no-fix" }>;

/** Input shape for {@link resolveAutofixOrSuggestionOutcome}. */
type AutofixOrSuggestionResolutionInput = Readonly<{
    canAutofix: boolean;
    fix: null | TSESLint.ReportFixFunction;
}>;

/** Concrete report descriptor type for a rule context. */
type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<TSESLint.RuleContext<MessageIds, Options>["report"]>[0];

/**
 * Report using plugin-aware autofix policy handling.
 */
export const reportWithTypefestPolicy = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    descriptor,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    descriptor: ReportDescriptor<MessageIds, Options>;
}>): void => {
    const settings = registerProgramSettingsForContext(context);

    if (!settings.disableAllAutofixes) {
        context.report(descriptor);

        return;
    }

    context.report(omitAutofixFromReportDescriptor(descriptor));
};

/**
 * Report a diagnostic with an optional direct fix.
 *
 * @remarks
 * When `fix` is absent this reports only `messageId` + `node`.
 */
export const reportWithOptionalFix = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    data,
    fix,
    messageId,
    node,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    data?: ReportDescriptor<MessageIds, Options>["data"];
    fix: null | TSESLint.ReportFixFunction;
    messageId: MessageIds;
    node: TSESTree.Node;
}>): void => {
    const descriptor: ReportDescriptor<MessageIds, Options> = {
        ...(data === undefined ? {} : { data }),
        ...(fix === null ? {} : { fix }),
        messageId,
        node,
    };

    reportWithTypefestPolicy({
        context,
        descriptor,
    });
};

/**
 * Resolve one of three standardized reporting outcomes:
 *
 * - No fix (`messageId` only),
 * - Direct autofix (`fix`), or
 * - Suggestion-only (`suggest`).
 */
export function resolveAutofixOrSuggestionOutcome({
    canAutofix,
    fix,
}: AutofixOrSuggestionResolutionInput): AutofixOrSuggestionOutcome {
    if (fix === null) {
        return {
            kind: "no-fix",
        };
    }

    if (canAutofix) {
        return {
            fix,
            kind: "autofix",
        };
    }

    return {
        fix,
        kind: "suggestion",
    };
}

/**
 * Report a previously resolved autofix/suggestion outcome.
 *
 * @remarks
 * - Suggestion outcomes are reported with a single `suggest` entry.
 * - Autofix and no-fix outcomes are delegated to {@link reportWithOptionalFix}.
 */
export const reportResolvedAutofixOrSuggestionOutcome = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>({
    context,
    data,
    messageId,
    node,
    outcome,
    suggestionMessageId,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
    data?: ReportDescriptor<MessageIds, Options>["data"];
    messageId: MessageIds;
    node: TSESTree.Node;
    outcome: AutofixOrSuggestionOutcome;
    suggestionMessageId: MessageIds;
}>): void => {
    if (outcome.kind === "suggestion") {
        reportWithTypefestPolicy({
            context,
            descriptor: {
                ...(data === undefined ? {} : { data }),
                messageId,
                node,
                suggest: [
                    {
                        fix: outcome.fix,
                        messageId: suggestionMessageId,
                    },
                ],
            },
        });

        return;
    }

    reportWithOptionalFix({
        context,
        data,
        fix: outcome.kind === "autofix" ? outcome.fix : null,
        messageId,
        node,
    });
};
