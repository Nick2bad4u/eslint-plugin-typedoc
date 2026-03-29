import { defineConfig } from "eslint-rule-benchmark";

export default defineConfig({
    iterations: 80,
    tests: [
        {
            cases: [
                {
                    testPath:
                        "./cases/require-exported-doc-comment/baseline.ts",
                },
                {
                    testPath: "./cases/require-exported-doc-comment/complex.ts",
                },
            ],
            name: "Rule: require-exported-doc-comment",
            ruleId: "typedoc/require-exported-doc-comment",
            rulePath: "../src/rules/require-exported-doc-comment.ts",
            warmup: {
                iterations: 15,
            },
        },
    ],
    timeout: 3000,
    warmup: {
        enabled: true,
        iterations: 20,
    },
});
