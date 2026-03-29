export type BenchmarkCase = Readonly<{
    code: string;
    description: string;
    name: string;
}>;

export const typedocBenchmarkCases: readonly BenchmarkCase[] = [
    {
        code: `/**\n * @return Value.\n */\nexport function normalize(value: string): string {\n    return value.trim();\n}`,
        description: "Alias-tag normalization baseline case",
        name: "no-typedoc-tag-alias",
    },
    {
        code: `/**\n * Parse input.\n */\nexport function parseInput(raw: string): string {\n    return raw.trim();\n}`,
        description: "Missing required TypeDoc tags baseline case",
        name: "enforce-typedoc-tags",
    },
];
