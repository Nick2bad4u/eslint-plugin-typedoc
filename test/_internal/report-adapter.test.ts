/**
 * @packageDocumentation
 * Unit tests for report-adapter autofix stripping helpers.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { describe, expect, it, vi } from "vitest";

import {
    createReportWithoutAutofixes,
    omitAutofixFromReportDescriptor,
} from "../../src/_internal/report-adapter";

type Descriptor = TSESLint.ReportDescriptor<MessageIds>;
type MessageIds = "blocked";

describe(omitAutofixFromReportDescriptor, () => {
    it("returns original descriptor when fix property is absent", () => {
        const descriptor = {
            messageId: "blocked",
            node: {} as never,
        } satisfies Descriptor;

        const result = omitAutofixFromReportDescriptor(descriptor);

        expect(result).toBe(descriptor);
    });

    it("strips function-valued top-level fix while preserving suggest entries", () => {
        const descriptor = {
            fix: () => null,
            messageId: "blocked",
            node: {} as never,
            suggest: [
                {
                    fix: () => null,
                    messageId: "blocked",
                },
            ],
        } satisfies Descriptor;

        const result = omitAutofixFromReportDescriptor(descriptor);

        expect(result).not.toBe(descriptor);
        expect("fix" in result).toBeFalsy();
        expect(result.suggest).toHaveLength(1);
    });

    it("does not mutate original descriptor object", () => {
        const descriptor = {
            fix: () => null,
            messageId: "blocked",
            node: {} as never,
        } satisfies Descriptor;

        const result = omitAutofixFromReportDescriptor(descriptor);

        expect(Object.hasOwn(descriptor, "fix")).toBeTruthy();
        expect(Object.hasOwn(result, "fix")).toBeFalsy();
    });

    it("preserves non-function fix values", () => {
        const descriptor = {
            fix: null,
            messageId: "blocked",
            node: {} as never,
        } as unknown as Descriptor;

        const result = omitAutofixFromReportDescriptor(descriptor);

        expect(result).toBe(descriptor);
        expect(result.fix).toBeNull();
    });
});

describe(createReportWithoutAutofixes, () => {
    it("reports with top-level autofix removed", () => {
        const reportSpy = vi.fn<(descriptor: Readonly<Descriptor>) => void>();
        const reportWithoutAutofixes = createReportWithoutAutofixes(reportSpy);

        reportWithoutAutofixes({
            fix: () => null,
            messageId: "blocked",
            node: {} as never,
            suggest: [
                {
                    fix: () => null,
                    messageId: "blocked",
                },
            ],
        });

        expect(reportSpy).toHaveBeenCalledTimes(1);

        const [reportedDescriptor] = reportSpy.mock.calls[0] as [Descriptor];

        expect(reportedDescriptor.fix).toBeUndefined();
        expect(reportedDescriptor.suggest).toHaveLength(1);
    });
});
