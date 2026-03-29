/**
 * @remarks
 * Counters are intentionally process-local and best-effort. They are designed
 * for benchmarks/tests, not for user-facing diagnostics.
 *
 * @packageDocumentation
 * Lightweight runtime telemetry for typed-rule hot paths.
 */
import { isDefined } from "ts-extras";

/** Immutable typed-path counter view exposed to consumers. */
export type TypedPathCounters = Readonly<{
    expensiveTypeCalls: number;
    fallbackInvocations: number;
    prefilterChecks: number;
    prefilterHits: number;
}>;

/**
 * Point-in-time telemetry snapshot grouped by file path.
 */
export type TypedPathTelemetrySnapshot = Readonly<{
    files: readonly Readonly<{
        counters: TypedPathCounters;
        filePath: string;
    }>[];
    totals: Readonly<
        TypedPathCounters & {
            averageExpensiveCallsPerFileInput: Readonly<{
                expensiveTypeCalls: number;
                fileCount: number;
            }>;
            fallbackInvocationRateInput: Readonly<{
                expensiveTypeCalls: number;
                fallbackInvocations: number;
            }>;
            fileCount: number;
            prefilterHitRateInput: Readonly<{
                prefilterChecks: number;
                prefilterHits: number;
            }>;
        }
    >;
}>;

type MutableTypedPathCounters = {
    expensiveTypeCalls: number;
    fallbackInvocations: number;
    prefilterChecks: number;
    prefilterHits: number;
};

const UNKNOWN_FILE_PATH = "<unknown>" as const;

const typedPathCountersByFilePath = new Map<string, MutableTypedPathCounters>();

const createEmptyCounters = (): MutableTypedPathCounters => ({
    expensiveTypeCalls: 0,
    fallbackInvocations: 0,
    prefilterChecks: 0,
    prefilterHits: 0,
});

const normalizeTelemetryFilePath = (
    filePath: null | string | undefined
): string => {
    if (typeof filePath !== "string") {
        return UNKNOWN_FILE_PATH;
    }

    const trimmedPath = filePath.trim();

    return trimmedPath.length > 0 ? trimmedPath : UNKNOWN_FILE_PATH;
};

const getCountersForFilePath = (
    filePath: null | string | undefined
): MutableTypedPathCounters => {
    const normalizedFilePath = normalizeTelemetryFilePath(filePath);
    const existingCounters =
        typedPathCountersByFilePath.get(normalizedFilePath);

    if (isDefined(existingCounters)) {
        return existingCounters;
    }

    const createdCounters = createEmptyCounters();

    typedPathCountersByFilePath.set(normalizedFilePath, createdCounters);

    return createdCounters;
};

/**
 * Record one prefilter evaluation.
 *
 * @param options - Telemetry file key plus whether prefilter short-circuited.
 */
export const recordTypedPathPrefilterEvaluation = ({
    filePath,
    prefilterHit,
}: Readonly<{
    filePath: null | string | undefined;
    prefilterHit: boolean;
}>): void => {
    const counters = getCountersForFilePath(filePath);

    counters.prefilterChecks += 1;

    if (prefilterHit) {
        counters.prefilterHits += 1;
    }
};

/**
 * Record one expensive type-resolution invocation.
 */
export const recordTypedPathExpensiveTypeCall = (
    filePath: null | string | undefined
): void => {
    const counters = getCountersForFilePath(filePath);

    counters.expensiveTypeCalls += 1;
};

/**
 * Record one fallback invocation after constrained resolution was unavailable
 * or failed.
 */
export const recordTypedPathFallbackInvocation = (
    filePath: null | string | undefined
): void => {
    const counters = getCountersForFilePath(filePath);

    counters.fallbackInvocations += 1;
};

/**
 * Read a deterministic telemetry snapshot for assertions and profiling.
 */
export const getTypedPathTelemetrySnapshot = (): TypedPathTelemetrySnapshot => {
    const sortedEntries = [...typedPathCountersByFilePath.entries()];

    sortedEntries.sort(([leftPath], [rightPath]) =>
        leftPath.localeCompare(rightPath)
    );

    const files: Readonly<{
        counters: TypedPathCounters;
        filePath: string;
    }>[] = [];
    const totals = createEmptyCounters();

    for (const [filePath, counters] of sortedEntries) {
        const immutableCounters: TypedPathCounters = Object.freeze({
            expensiveTypeCalls: counters.expensiveTypeCalls,
            fallbackInvocations: counters.fallbackInvocations,
            prefilterChecks: counters.prefilterChecks,
            prefilterHits: counters.prefilterHits,
        });

        files.push(
            Object.freeze({
                counters: immutableCounters,
                filePath,
            })
        );

        totals.expensiveTypeCalls += immutableCounters.expensiveTypeCalls;
        totals.fallbackInvocations += immutableCounters.fallbackInvocations;
        totals.prefilterChecks += immutableCounters.prefilterChecks;
        totals.prefilterHits += immutableCounters.prefilterHits;
    }

    const frozenFiles = Object.freeze([...files]);
    const fileCount = frozenFiles.length;

    return {
        files: frozenFiles,
        totals: Object.freeze({
            ...totals,
            averageExpensiveCallsPerFileInput: Object.freeze({
                expensiveTypeCalls: totals.expensiveTypeCalls,
                fileCount,
            }),
            fallbackInvocationRateInput: Object.freeze({
                expensiveTypeCalls: totals.expensiveTypeCalls,
                fallbackInvocations: totals.fallbackInvocations,
            }),
            fileCount,
            prefilterHitRateInput: Object.freeze({
                prefilterChecks: totals.prefilterChecks,
                prefilterHits: totals.prefilterHits,
            }),
        }),
    };
};

/**
 * Clear all process-local telemetry counters.
 */
export const resetTypedPathTelemetry = (): void => {
    typedPathCountersByFilePath.clear();
};
