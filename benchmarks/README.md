# ESLint Benchmark Suite

This directory contains **meaningful ESLint performance benchmarks** for `eslint-plugin-typefest`.

The suite intentionally measures three complementary workloads:

- **Real corpus benchmarks** against `test/fixtures/typed/*.invalid.ts` so rule timing reflects real rule inputs.
- **Valid corpus benchmarks** against `test/fixtures/typed/*.valid.ts` to track near-clean traversal overhead.
- **Curated zero-message benchmark** against `benchmarks/fixtures/recommended-zero-message.baseline.ts` for a true steady-state baseline.
- **Preset-focused benchmarks** (`recommended`, `strict`, `ts-extras/type-guards`, `type-fest/types`) so regressions are attributable to a config surface.
- **Single-rule stress benchmarks** for focused hot-path investigation (`prefer-ts-extras-is-present`, `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, `prefer-type-fest-arrayable`), including both `fix=false` and `fix=true` for `prefer-ts-extras-safe-cast-to`.

## Why this is meaningful

- Uses actual fixture corpora already maintained by rule tests.
- Uses typed linting (`parserOptions.project` with `tsconfig.eslint.json`) to include TypeScript checker overhead where applicable.
- Includes both **fix=false** and **fix=true** scenarios so autofix cost is visible.
- Captures ESLint timing data (`result.stats`) instead of relying only on wall-clock time.

## Run benchmarks

### Default benchmark runner

```bash
npm run bench
```

This runs `benchmarks/run-eslint-stats.mjs` with the default iteration/warmup settings and writes JSON to `coverage/benchmarks/eslint-stats.json`.

### ESLint stats summary runner

```bash
npm run bench:eslint:stats
```

Optional knobs:

```bash
node benchmarks/run-eslint-stats.mjs --iterations=5 --warmup=2
```

Compare against a previously generated stats file:

```bash
node benchmarks/run-eslint-stats.mjs --compare=coverage/benchmarks/eslint-stats.json
```

Or use the convenience script:

```bash
npm run bench:compare
```

This writes scenario metrics and top-rule timing breakdowns to `coverage/benchmarks/eslint-stats.json`.

### Optional Vitest benchmark mode (experimental)

```bash
npm run bench:watch
```

This executes `benchmarks/**/*.bench.*` and writes benchmark JSON to `coverage/bench-results.json`.

## Rule benchmark conventions (`eslint-rule-benchmark`)

- The rule benchmark config is loaded from `benchmark/config.ts` via:

  ```bash
  npm run bench:rule-benchmark
  ```

- Benchmark case files under `benchmark/cases/**` use `.ts` extensions.

- The benchmark rule path should point to source rule modules (for example `../src/rules/<rule-id>.ts`) so local rule edits are benchmarked directly.

- Keep warmup/iteration defaults in `benchmark/config.ts` at meaningful levels for stable comparisons; only lower them temporarily for local smoke checks.

- We intentionally run `eslint-rule-benchmark run` without `--config` because the current CLI fails to load the TypeScript config file when an explicit config path is passed on Windows.

### CLI TIMING + --stats (ESLint docs-aligned)

```bash
npm run bench:eslint:timing
```

This command enables `TIMING=all` and `--stats` to mirror ESLint's documented rule timing workflow.

## Interpreting results

- Use `recommended-invalid-corpus` as your baseline for day-to-day regressions.
- Use `recommended-valid-corpus` to measure steady-state cost on already-correct code paths.
- Use `recommended-zero-message-corpus` for a strict zero-violation steady-state baseline.
- Use single-rule stress scenarios to isolate specific rule regressions before broad config runs.
- Compare `fix=false` vs `fix=true` to understand whether regressions come from detection or fixer generation.
