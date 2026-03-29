# ESLint benchmark suite

This directory contains performance benchmarks for `eslint-plugin-typedoc`.

## Benchmark goals

- measure baseline overhead for recommended and strict presets,
- validate benchmark signal on invalid and valid documentation fixture corpora,
- keep timing output reproducible across local runs and CI.

## Included benchmark entrypoints

- `benchmarks/eslint-rules.bench.mjs` — Vitest benchmark scenarios.
- `benchmarks/run-eslint-stats.mjs` — ESLint Node API benchmark runner with JSON output.
- `benchmarks/eslint-timing.config.mjs` — timing-focused ESLint flat config.

## Fixture sources

- `benchmarks/fixtures/documentation.invalid.ts`
- `benchmarks/fixtures/documentation.valid.ts`

## Run benchmarks

```bash
npm run bench
```

```bash
npm run bench:eslint:stats
```

```bash
npm run bench:eslint:timing
```

## Output

`benchmarks/run-eslint-stats.mjs` writes a report to:

- `coverage/benchmarks/eslint-stats.json`
