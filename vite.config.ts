import { defineConfig } from "vitest/config";

const isCiEnvironment = process.env["CI"] === "true";
const configuredMaxWorkers = Number.parseInt(
    process.env["MAX_THREADS"] ?? (isCiEnvironment ? "1" : "4"),
    10
);
const maxWorkers =
    Number.isFinite(configuredMaxWorkers) && configuredMaxWorkers > 0
        ? configuredMaxWorkers
        : 1;
const shouldTypecheck = process.env["VITEST_TYPECHECK"] !== "false";

const vitestConfig: ReturnType<typeof defineConfig> = defineConfig({
    test: {
        coverage: {
            exclude: [
                "**/*.d.ts",
                "**/*.spec.ts",
                "**/*.test.ts",
                "docs/**",
                "dist/**",
                "test/**",
            ],
            include: ["plugin.mjs", "src/**/*.ts"],
            provider: "v8",
            reporter: [
                "text",
                "json",
                "lcov",
            ],
            reportsDirectory: "./coverage",
        },
        environment: "node",
        exclude: [
            "**/.cache/**",
            "**/coverage/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/temp/**",
            "docs/**",
        ],
        globals: false,
        include: [
            "test/**/*.test.ts",
            "test/**/*.spec.ts",
            "test/**/*.test-d.ts",
        ],
        maxWorkers,
        reporters: ["default"],
        typecheck: {
            enabled: shouldTypecheck,
            include: ["test/**/*.test-d.ts"],
            tsconfig: "./tsconfig.vitest-typecheck.json",
        },
    },
});

export default vitestConfig;
