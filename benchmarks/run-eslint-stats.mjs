import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(repositoryRoot, "coverage", "benchmarks");
const outputFilePath = resolve(outputDirectory, "eslint-stats.json");

const timestamp = new Date().toISOString();

const stats = {
    note: "Minimal benchmark scaffold for eslint-plugin-typedoc.",
    timestamp,
};

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputFilePath, `${JSON.stringify(stats, null, 4)}\n`, "utf8");

console.log(`Wrote benchmark stats to ${outputFilePath}`);
