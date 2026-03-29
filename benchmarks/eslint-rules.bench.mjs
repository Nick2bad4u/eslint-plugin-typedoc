import { bench, describe } from "vitest";

const typedocBenchmarkCases = [
    {
        code: `/**\n * @return Value.\n */\nexport function normalize(value: string): string {\n    return value.trim();\n}`,
        name: "no-typedoc-tag-alias",
    },
    {
        code: `/**\n * Parse input.\n */\nexport function parseInput(raw: string): string {\n    return raw.trim();\n}`,
        name: "enforce-typedoc-tags",
    },
];

describe("typedoc rule benchmark inputs", () => {
    for (const benchmarkCase of typedocBenchmarkCases) {
        bench(benchmarkCase.name, () => {
            // This benchmark isolates fixture parsing/string handling overhead.
            JSON.stringify(benchmarkCase.code);
        });
    }
});
