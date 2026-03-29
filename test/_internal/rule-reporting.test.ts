/**
 * @packageDocumentation
 * Vitest coverage for shared rule-reporting helpers.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { describe, expect, it, vi } from "vitest";

import { reportWithOptionalFix } from "../../src/_internal/rule-reporting";

type MessageId = "preferTsExtrasAssertDefined" | "suggestTsExtrasAssertDefined";

type RuleContextLike = TSESLint.RuleContext<MessageId, readonly unknown[]>;

const node = {
    type: "Identifier",
} as unknown as TSESTree.Node;

const createFix = (): TSESLint.ReportFixFunction => {
    const edit = {
        range: [0, 0] as const,
        text: "replacement",
    };

    return () => edit;
};

const createContext = () => {
    const report = vi.fn<RuleContextLike["report"]>();
    const program = {
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    } as unknown as TSESTree.Program;

    return {
        context: {
            report,
            settings: {},
            sourceCode: {
                ast: program,
            },
        } as unknown as RuleContextLike,
        report,
    };
};

describe("rule-reporting helpers", () => {
    it("reportWithOptionalFix reports message-only descriptor when fix is null", () => {
        const { context, report } = createContext();

        reportWithOptionalFix({
            context,
            fix: null,
            messageId: "preferTsExtrasAssertDefined",
            node,
        });

        expect(report).toHaveBeenCalledTimes(1);
        expect(report.mock.calls[0]?.[0]).toMatchObject({
            messageId: "preferTsExtrasAssertDefined",
            node,
        });
        expect(report.mock.calls[0]?.[0]).not.toHaveProperty("fix");
    });

    it("reportWithOptionalFix reports direct fix when provided", () => {
        const { context, report } = createContext();
        const fix = createFix();

        reportWithOptionalFix({
            context,
            fix,
            messageId: "preferTsExtrasAssertDefined",
            node,
        });

        expect(report).toHaveBeenCalledTimes(1);
        expect(report.mock.calls[0]?.[0]).toMatchObject({
            fix,
            messageId: "preferTsExtrasAssertDefined",
            node,
        });
    });

    it("reportWithOptionalFix includes report data when provided", () => {
        const { context, report } = createContext();

        reportWithOptionalFix({
            context,
            data: {
                alias: "OldAlias",
                replacement: "NewAlias",
            },
            fix: null,
            messageId: "preferTsExtrasAssertDefined",
            node,
        });

        expect(report).toHaveBeenCalledTimes(1);
        expect(report.mock.calls[0]?.[0]).toMatchObject({
            data: {
                alias: "OldAlias",
                replacement: "NewAlias",
            },
            messageId: "preferTsExtrasAssertDefined",
            node,
        });
    });

    it("reportWithOptionalFix strips top-level fix when disableAllAutofixes is enabled", () => {
        const { context, report } = createContext();
        const fix = createFix();

        context.settings = {
            typefest: {
                disableAllAutofixes: true,
            },
        };

        reportWithOptionalFix({
            context,
            fix,
            messageId: "preferTsExtrasAssertDefined",
            node,
        });

        expect(report).toHaveBeenCalledTimes(1);
        expect(report.mock.calls[0]?.[0]).toMatchObject({
            messageId: "preferTsExtrasAssertDefined",
            node,
        });
        expect(report.mock.calls[0]?.[0]).not.toHaveProperty("fix");
    });
});
