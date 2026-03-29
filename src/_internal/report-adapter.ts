/**
 * @packageDocumentation
 * Explicit report-adapter utilities for rule-level autofix policy handling.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { isDefined, objectHasOwn } from "ts-extras";

/**
 * Report callback type for a given message/options pair.
 */
type ReportCallback<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = TSESLint.RuleContext<MessageIds, Options>["report"];

/**
 * Canonical report descriptor type for a given message/options pair.
 */
type ReportDescriptor<
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
> = Parameters<ReportCallback<MessageIds, Options>>[0];

/**
 * Determine whether a report descriptor has a callable own data-property `fix`
 * value that can be safely omitted.
 */
const hasCallableOwnFixDataProperty = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    descriptor: Readonly<ReportDescriptor<MessageIds, Options>>
): boolean => {
    const ownFixDescriptor = Object.getOwnPropertyDescriptor(descriptor, "fix");
    if (!isDefined(ownFixDescriptor)) {
        return false;
    }

    if (!objectHasOwn(ownFixDescriptor, "value")) {
        return false;
    }

    return typeof ownFixDescriptor.value === "function";
};

/**
 * Remove top-level autofix from a report descriptor while preserving all other
 * fields (including suggestions).
 */
export const omitAutofixFromReportDescriptor = <
    MessageIds extends string,
    Options extends Readonly<UnknownArray>,
>(
    descriptor: Readonly<ReportDescriptor<MessageIds, Options>>
): ReportDescriptor<MessageIds, Options> => {
    if (!hasCallableOwnFixDataProperty(descriptor)) {
        return descriptor;
    }

    const descriptorWithoutFix = {
        ...descriptor,
    };

    delete descriptorWithoutFix.fix;

    return descriptorWithoutFix;
};

/**
 * Build a report callback that enforces no-top-level-autofix semantics.
 */
export const createReportWithoutAutofixes =
    <MessageIds extends string, Options extends Readonly<UnknownArray>>(
        report: ReportCallback<MessageIds, Options>
    ): ReportCallback<MessageIds, Options> =>
    (descriptor) => {
        report(omitAutofixFromReportDescriptor(descriptor));
    };
