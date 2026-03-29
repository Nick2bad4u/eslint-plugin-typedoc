import { defineConfig } from "eslint-rule-benchmark";

export default defineConfig({
    iterations: 80,
    tests: [
        {
            cases: [
                {
                    testPath: "./cases/prefer-ts-extras-is-defined/baseline.ts",
                },
                {
                    testPath: "./cases/prefer-ts-extras-is-defined/complex.ts",
                },
            ],
            name: "Rule: prefer-ts-extras-is-defined",
            ruleId: "typefest/prefer-ts-extras-is-defined",
            rulePath: "../src/rules/prefer-ts-extras-is-defined.ts",
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
