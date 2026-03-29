interface BenchmarkRecord {
    readonly id: number;
    readonly normalizedRows?: string;
    readonly scores: readonly number[];
    readonly title: string;
}

const benchmarkRecords: readonly BenchmarkRecord[] = [
    {
        id: 1,
        scores: [
            93,
            88,
            91,
        ],
        title: "alpha",
    },
    {
        id: 2,
        scores: [
            84,
            86,
            89,
        ],
        title: "bravo",
    },
    {
        id: 3,
        scores: [
            95,
            97,
            96,
        ],
        title: "charlie",
    },
];

/**
 * Build a tiny but representative baseline workload that should remain
 * violation-free under the recommended preset.
 */
const summarizeRecords = (records: readonly BenchmarkRecord[]): string => {
    const normalizedRows = [];

    for (const record of records) {
        const firstScore = record.scores[0] ?? 0;
        normalizedRows.push(`${record.id}:${record.title}:${firstScore}`);
    }

    return `${records.length}:${normalizedRows.join("|")}`;
};

export const recommendedZeroMessageBaseline: string =
    summarizeRecords(benchmarkRecords);
