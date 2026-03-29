#!/usr/bin/env node

/**
 * Create-eslint-plugin-project.mjs (ESM)
 *
 * Creates/bootstraps an npm project and installs production + dev dependencies.
 *
 * Usage examples: node create-eslint-plugin-project.mjs node
 * create-eslint-plugin-project.mjs --yes --force node
 * create-eslint-plugin-project.mjs --skip-init --chunk-size=60 --retries=2
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const prodDeps = [
    "@typescript-eslint/parser@latest",
    "@typescript-eslint/utils@latest",
    "ts-extras@latest",
    "type-fest@latest",
];

const devDeps = [
    "@arethetypeswrong/cli@latest",
    "@csstools/stylelint-formatter-github@latest",
    "@docusaurus/eslint-plugin@latest",
    "@double-great/remark-lint-alt-text@latest",
    "@double-great/stylelint-a11y@latest",
    "@eslint-community/eslint-plugin-eslint-comments@latest",
    "@eslint-react/eslint-plugin@latest",
    "@eslint/compat@latest",
    "@eslint/config-helpers@latest",
    "@eslint/config-inspector@latest",
    "@eslint/css@latest",
    "@eslint/js@latest",
    "@eslint/json@latest",
    "@eslint/markdown@latest",
    "@html-eslint/eslint-plugin@latest",
    "@html-eslint/parser@latest",
    "@microsoft/eslint-plugin-sdl@latest",
    "@microsoft/tsdoc-config@latest",
    "@secretlint/secretlint-rule-anthropic@latest",
    "@secretlint/secretlint-rule-aws@latest",
    "@secretlint/secretlint-rule-database-connection-string@latest",
    "@secretlint/secretlint-rule-gcp@latest",
    "@secretlint/secretlint-rule-github@latest",
    "@secretlint/secretlint-rule-no-dotenv@latest",
    "@secretlint/secretlint-rule-no-homedir@latest",
    "@secretlint/secretlint-rule-npm@latest",
    "@secretlint/secretlint-rule-openai@latest",
    "@secretlint/secretlint-rule-pattern@latest",
    "@secretlint/secretlint-rule-preset-recommend@latest",
    "@secretlint/secretlint-rule-privatekey@latest",
    "@secretlint/secretlint-rule-secp256k1-privatekey@latest",
    "@secretlint/types@latest",
    "@softonus/prettier-plugin-duplicate-remover@latest",
    "@stryker-ignorer/console-all@latest",
    "@stryker-mutator/core@latest",
    "@stryker-mutator/typescript-checker@latest",
    "@stryker-mutator/vitest-runner@latest",
    "@stylelint-types/stylelint-order@latest",
    "@stylelint-types/stylelint-stylistic@latest",
    "@stylistic/eslint-plugin@latest",
    "@stylistic/stylelint-plugin@latest",
    "@types/eslint-plugin-jsx-a11y@latest",
    "@types/eslint-plugin-security@latest",
    "@types/htmlhint@latest",
    "@types/madge@latest",
    "@types/node@latest",
    "@types/postcss-clamp@latest",
    "@types/postcss-flexbugs-fixes@latest",
    "@types/postcss-html@latest",
    "@types/postcss-import@latest",
    "@types/postcss-inline-svg@latest",
    "@types/postcss-normalize@latest",
    "@types/postcss-reporter@latest",
    "@types/sloc@latest",
    "@typescript-eslint/eslint-plugin@latest",
    "@typescript-eslint/rule-tester@latest",
    "@vitest/coverage-v8@latest",
    "@vitest/eslint-plugin@latest",
    "@vitest/ui@latest",
    "actionlint@latest",
    "all-contributors-cli@latest",
    "cognitive-complexity-ts@latest",
    "commitlint@latest",
    "cross-env@latest",
    "depcheck@latest",
    "detect-secrets@latest",
    "eslint@latest",
    "eslint-config-flat-gitignore@latest",
    "eslint-config-prettier@latest",
    "eslint-formatter-unix@latest",
    "eslint-import-resolver-typescript@latest",
    "eslint-plugin-array-func@latest",
    "eslint-plugin-canonical@latest",
    "eslint-plugin-case-police@latest",
    "eslint-plugin-comment-length@latest",
    "eslint-plugin-css-modules@latest",
    "eslint-plugin-de-morgan@latest",
    "eslint-plugin-depend@latest",
    "eslint-plugin-eslint-plugin@latest",
    "eslint-plugin-etc@latest",
    "eslint-plugin-file-progress-2@latest",
    "eslint-plugin-html@latest",
    "eslint-plugin-import-x@latest",
    "eslint-plugin-jsdoc@latest",
    "eslint-plugin-jsonc@latest",
    "eslint-plugin-jsx-a11y@latest",
    "eslint-plugin-listeners@latest",
    "eslint-plugin-loadable-imports@latest",
    "eslint-plugin-math@latest",
    "eslint-plugin-module-interop@latest",
    "eslint-plugin-n@latest",
    "eslint-plugin-nitpick@latest",
    "eslint-plugin-no-barrel-files@latest",
    "eslint-plugin-no-explicit-type-exports@latest",
    "eslint-plugin-no-function-declare-after-return@latest",
    "eslint-plugin-no-lookahead-lookbehind-regexp@latest",
    "eslint-plugin-no-only-tests@latest",
    "eslint-plugin-no-secrets@latest",
    "eslint-plugin-no-unsanitized@latest",
    "eslint-plugin-no-use-extend-native@latest",
    "eslint-plugin-node-dependencies@latest",
    "eslint-plugin-package-json@latest",
    "eslint-plugin-perfectionist@latest",
    "eslint-plugin-prefer-arrow@latest",
    "eslint-plugin-prettier@latest",
    "eslint-plugin-promise@latest",
    "eslint-plugin-redos@latest",
    "eslint-plugin-regexp@latest",
    "eslint-plugin-require-jsdoc@latest",
    "eslint-plugin-security@latest",
    "eslint-plugin-sonarjs@latest",
    "eslint-plugin-sort-class-members@latest",
    "eslint-plugin-testing-library@latest",
    "eslint-plugin-toml@latest",
    "eslint-plugin-total-functions@latest",
    "eslint-plugin-tsdoc@latest",
    "eslint-plugin-tsdoc-require-2@latest",
    "eslint-plugin-undefined-css-classes@latest",
    "eslint-plugin-unicorn@latest",
    "eslint-plugin-unused-imports@latest",
    "eslint-plugin-write-good-comments@latest",
    "eslint-plugin-yml@latest",
    "fast-check@latest",
    "git-cliff@latest",
    "gitleaks-secret-scanner@latest",
    "globals@latest",
    "htmlhint@latest",
    "jscpd@latest",
    "jsonc-eslint-parser@latest",
    "knip@latest",
    "leasot@latest",
    "madge@latest",
    "markdown-link-check@latest",
    "npm-check-updates@latest",
    "npm-package-json-lint@latest",
    "picocolors@latest",
    "postcss@latest",
    "postcss-assets@latest",
    "postcss-clamp@latest",
    "postcss-combine-duplicated-selectors@latest",
    "postcss-flexbugs-fixes@latest",
    "postcss-html@latest",
    "postcss-import@latest",
    "postcss-inline-svg@latest",
    "postcss-logical@latest",
    "postcss-normalize@latest",
    "postcss-reporter@latest",
    "postcss-round-subpixels@latest",
    "postcss-scss@latest",
    "postcss-sort-media-queries@latest",
    "postcss-styled-jsx@latest",
    "postcss-styled-syntax@latest",
    "postcss-viewport-height-correction@latest",
    "prettier@latest",
    "prettier-plugin-ini@latest",
    "prettier-plugin-interpolated-html-tags@latest",
    "prettier-plugin-jsdoc@latest",
    "prettier-plugin-jsdoc-type@latest",
    "prettier-plugin-merge@latest",
    "prettier-plugin-multiline-arrays@latest",
    "prettier-plugin-packagejson@latest",
    "prettier-plugin-properties@latest",
    "prettier-plugin-sort-json@latest",
    "prettier-plugin-toml@latest",
    "publint@latest",
    "recheck-jar@latest",
    "rehype-katex@latest",
    "remark@latest",
    "remark-cli@latest",
    "remark-directive@latest",
    "remark-frontmatter@latest",
    "remark-gfm@latest",
    "remark-ignore@latest",
    "remark-inline-links@latest",
    "remark-lint@latest",
    "remark-lint-blockquote-indentation@latest",
    "remark-lint-check-toc@latest",
    "remark-lint-checkbox-character-style@latest",
    "remark-lint-checkbox-content-indent@latest",
    "remark-lint-code-block-split-list@latest",
    "remark-lint-code-block-style@latest",
    "remark-lint-correct-media-syntax@latest",
    "remark-lint-definition-case@latest",
    "remark-lint-definition-sort@latest",
    "remark-lint-definition-spacing@latest",
    "remark-lint-directive-attribute-sort@latest",
    "remark-lint-directive-collapsed-attribute@latest",
    "remark-lint-directive-quote-style@latest",
    "remark-lint-directive-shortcut-attribute@latest",
    "remark-lint-directive-unique-attribute-name@latest",
    "remark-lint-emphasis-marker@latest",
    "remark-lint-fenced-code-flag@latest",
    "remark-lint-fenced-code-flag-case@latest",
    "remark-lint-fenced-code-marker@latest",
    "remark-lint-file-extension@latest",
    "remark-lint-final-definition@latest",
    "remark-lint-final-newline@latest",
    "remark-lint-first-heading-level@latest",
    "remark-lint-frontmatter-schema@latest",
    "remark-lint-hard-break-spaces@latest",
    "remark-lint-heading-capitalization@latest",
    "remark-lint-heading-increment@latest",
    "remark-lint-heading-style@latest",
    "remark-lint-heading-whitespace@latest",
    "remark-lint-linebreak-style@latest",
    "remark-lint-link-title-style@latest",
    "remark-lint-list-item-bullet-indent@latest",
    "remark-lint-list-item-content-indent@latest",
    "remark-lint-list-item-indent@latest",
    "remark-lint-list-item-spacing@latest",
    "remark-lint-maximum-heading-length@latest",
    "remark-lint-maximum-line-length@latest",
    "remark-lint-mdx-jsx-attribute-sort@latest",
    "remark-lint-mdx-jsx-no-void-children@latest",
    "remark-lint-mdx-jsx-quote-style@latest",
    "remark-lint-mdx-jsx-self-close@latest",
    "remark-lint-mdx-jsx-shorthand-attribute@latest",
    "remark-lint-mdx-jsx-unique-attribute-name@latest",
    "remark-lint-media-style@latest",
    "remark-lint-no-blockquote-without-marker@latest",
    "remark-lint-no-consecutive-blank-lines@latest",
    "remark-lint-no-dead-urls@latest",
    "remark-lint-no-duplicate-defined-urls@latest",
    "remark-lint-no-duplicate-definitions@latest",
    "remark-lint-no-duplicate-headings@latest",
    "remark-lint-no-duplicate-headings-in-section@latest",
    "remark-lint-no-emphasis-as-heading@latest",
    "remark-lint-no-empty-sections@latest",
    "remark-lint-no-empty-url@latest",
    "remark-lint-no-file-name-articles@latest",
    "remark-lint-no-file-name-consecutive-dashes@latest",
    "remark-lint-no-file-name-irregular-characters@latest",
    "remark-lint-no-file-name-mixed-case@latest",
    "remark-lint-no-file-name-outer-dashes@latest",
    "remark-lint-no-heading-content-indent@latest",
    "remark-lint-no-heading-indent@latest",
    "remark-lint-no-heading-like-paragraph@latest",
    "remark-lint-no-heading-punctuation@latest",
    "remark-lint-no-hidden-table-cell@latest",
    "remark-lint-no-html@latest",
    "remark-lint-no-literal-urls@latest",
    "remark-lint-no-missing-blank-lines@latest",
    "remark-lint-no-multiple-toplevel-headings@latest",
    "remark-lint-no-paragraph-content-indent@latest",
    "remark-lint-no-reference-like-url@latest",
    "remark-lint-no-shell-dollars@latest",
    "remark-lint-no-shortcut-reference-image@latest",
    "remark-lint-no-shortcut-reference-link@latest",
    "remark-lint-no-table-indentation@latest",
    "remark-lint-no-tabs@latest",
    "remark-lint-no-undefined-references@latest",
    "remark-lint-no-unneeded-full-reference-image@latest",
    "remark-lint-no-unneeded-full-reference-link@latest",
    "remark-lint-no-unused-definitions@latest",
    "remark-lint-ordered-list-marker-style@latest",
    "remark-lint-ordered-list-marker-value@latest",
    "remark-lint-rule-style@latest",
    "remark-lint-strikethrough-marker@latest",
    "remark-lint-strong-marker@latest",
    "remark-lint-table-cell-padding@latest",
    "remark-lint-table-pipe-alignment@latest",
    "remark-lint-table-pipes@latest",
    "remark-lint-unordered-list-marker-style@latest",
    "remark-lint-write-good@latest",
    "remark-math@latest",
    "remark-preset-lint-consistent@latest",
    "remark-preset-lint-markdown-style-guide@latest",
    "remark-preset-lint-recommended@latest",
    "remark-preset-prettier@latest",
    "remark-toc@latest",
    "remark-validate-links@latest",
    "remark-wiki-link@latest",
    "rimraf@latest",
    "secretlint@latest",
    "sloc@latest",
    "sort-package-json@latest",
    "stylelint@latest",
    "stylelint-actions-formatters@latest",
    "stylelint-checkstyle-formatter@latest",
    "stylelint-codeframe-formatter@latest",
    "stylelint-config-alphabetical-order@latest",
    "stylelint-config-idiomatic-order@latest",
    "stylelint-config-recess-order@latest",
    "stylelint-config-recommended@latest",
    "stylelint-config-sass-guidelines@latest",
    "stylelint-config-standard@latest",
    "stylelint-config-standard-scss@latest",
    "stylelint-config-tailwindcss@latest",
    "stylelint-declaration-block-no-ignored-properties@latest",
    "stylelint-declaration-strict-value@latest",
    "stylelint-define-config@latest",
    "stylelint-find-new-rules@latest",
    "stylelint-formatter-gitlab-code-quality-report@latest",
    "stylelint-formatter-pretty@latest",
    "stylelint-gamut@latest",
    "stylelint-group-selectors@latest",
    "stylelint-high-performance-animation@latest",
    "stylelint-media-use-custom-media@latest",
    "stylelint-no-browser-hacks@latest",
    "stylelint-no-indistinguishable-colors@latest",
    "stylelint-no-restricted-syntax@latest",
    "stylelint-no-unresolved-module@latest",
    "stylelint-no-unsupported-browser-features@latest",
    "stylelint-order@latest",
    "stylelint-plugin-defensive-css@latest",
    "stylelint-plugin-logical-css@latest",
    "stylelint-plugin-use-baseline@latest",
    "stylelint-prettier@latest",
    "stylelint-react-native@latest",
    "stylelint-scales@latest",
    "stylelint-selector-bem-pattern@latest",
    "stylelint-use-nesting@latest",
    "stylelint-value-no-unknown-custom-properties@latest",
    "toml-eslint-parser@latest",
    "ts-unused-exports@latest",
    "typedoc@latest",
    "typescript@latest",
    "typescript-eslint@latest",
    "typesync@latest",
    "vfile@latest",
    "vite@latest",
    "vite-tsconfig-paths@latest",
    "vitest@latest",
    "yaml-eslint-parser@latest",
    "yamllint-js@latest",
];

/**
 * Parsed command-line arguments.
 *
 * @typedef ParsedArgs
 *
 * @property {boolean} yes - Allow potentially destructive actions without
 *   prompting.
 * @property {boolean} force - Pass `--force` to npm install commands.
 * @property {boolean} skipInit - Skip `npm init -y`.
 * @property {number} chunkSize - Number of devDependencies per install chunk.
 * @property {number} retries - Number of retries after the initial failed
 *   attempt.
 * @property {number} timeoutMs - Command timeout in milliseconds (`0` disables
 *   timeout).
 */

/**
 * Options for executing a child-process command.
 *
 * @typedef RunCommandOptions
 *
 * @property {number} [timeoutMs] - Command timeout in milliseconds (`0`
 *   disables timeout).
 */

/**
 * @param {readonly string[]} argv
 *
 * @returns {ParsedArgs}
 */
function parseArgs(argv) {
    const flags = new Set();
    const values = new Map();

    for (const arg of argv) {
        if (!arg.startsWith("--")) continue;
        const [k, v] = arg.split("=", 2);
        if (v === undefined) flags.add(k);
        else values.set(k, v);
    }

    return {
        yes: flags.has("--yes"),
        force: flags.has("--force"),
        skipInit: flags.has("--skip-init"),
        chunkSize: Number(values.get("--chunk-size") ?? 80),
        retries: Number(values.get("--retries") ?? 1),
        timeoutMs: Number(values.get("--timeout-ms") ?? 0),
    };
}

/**
 * Returns unique items while preserving insertion order.
 *
 * @template T - Item type.
 *
 * @param {Iterable<T> | null | undefined} arr - Input collection.
 *
 * @returns {T[]} A deduplicated array.
 */
const uniq = (arr) => [...new Set(arr ?? [])];

/**
 * Extracts the package name from a spec string (handles scoped/unscoped).
 *
 * @param {string} spec
 *
 * @returns {string}
 */
function pkgName(spec) {
    // If scoped package, find last '@' after the first character
    if (spec.startsWith("@")) {
        const at = spec.lastIndexOf("@");
        // If there's a version, remove it; otherwise, return the whole string
        return at > 0 ? spec.slice(0, at) : spec;
    }
    // For unscoped, remove version if present
    const at = spec.indexOf("@");
    return at > 0 ? spec.slice(0, at) : spec;
}

/**
 * @param {readonly string[]} a
 * @param {readonly string[]} b
 *
 * @returns {string[]}
 */
function overlap(a, b) {
    const bSet = new Set(b.map(pkgName));
    return a.map(pkgName).filter((x) => bSet.has(x));
}

/**
 * Splits an array into fixed-size chunks.
 *
 * @template T - Element type.
 *
 * @param {readonly T[]} arr - Source array.
 * @param {number} chunkSize - Max number of items per chunk.
 *
 * @returns {T[][]} Array of chunks.
 */
function chunkArray(arr, chunkSize) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 *
 * @returns {string}
 */
function prettyCmd(cmd, args) {
    return `${cmd} ${args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`;
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 * @param {RunCommandOptions} [options]
 *
 * @returns {Promise<void>}
 */
function runCommand(cmd, args, { timeoutMs = 0 } = {}) {
    return new Promise(
        /**
         * @param {() => void} resolve
         * @param {(reason?: unknown) => void} reject
         */
        (resolve, reject) => {
            const commandStr = prettyCmd(cmd, args);
            console.log(`\n> ${commandStr}`);

            const child = spawn(cmd, args, {
                stdio: "inherit",
                shell: false,
            });

            /** @type {ReturnType<typeof setTimeout> | null} */
            let timer = null;
            if (timeoutMs > 0) {
                timer = setTimeout(() => {
                    child.kill("SIGTERM");
                    reject(
                        new Error(
                            `Command timed out after ${timeoutMs} ms: ${commandStr}`
                        )
                    );
                }, timeoutMs);
            }

            child.on("close", (code) => {
                if (timer) clearTimeout(timer);
                if (code === 0) resolve();
                else
                    reject(new Error(`${commandStr} exited with code ${code}`));
            });

            child.on("error", (err) => {
                if (timer) clearTimeout(timer);
                reject(err);
            });
        }
    );
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 * @param {number} retries
 * @param {RunCommandOptions} [opts]
 *
 * @returns {Promise<void>}
 */
async function runWithRetry(cmd, args, retries, opts) {
    let attempt = 0;
    /** @type {unknown} */
    let lastErr;
    const totalAttempts = Math.max(1, retries + 1);

    while (attempt < totalAttempts) {
        try {
            await runCommand(cmd, args, opts);
            return;
        } catch (err) {
            lastErr = err;
            attempt += 1;
            if (attempt < totalAttempts) {
                console.warn(
                    `Attempt ${attempt}/${totalAttempts} failed. Retrying...`
                );
            }
        }
    }

    throw lastErr;
}

/**
 * @param {{ yes: boolean }} param0
 *
 * @returns {void}
 */
function ensureSafeToInit({ yes }) {
    const pkgPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(pkgPath)) return;

    if (!yes) {
        throw new Error(
            "package.json already exists. Refusing to run npm init -y automatically.\n" +
                "Use --skip-init to keep existing package.json, or --yes to proceed intentionally."
        );
    }
}

/**
 * @returns {Promise<void>}
 */
async function main() {
    const t0 = Date.now();
    const options = parseArgs(process.argv.slice(2));

    if (!Number.isFinite(options.chunkSize) || options.chunkSize <= 0) {
        throw new Error(`Invalid --chunk-size: ${options.chunkSize}`);
    }
    if (!Number.isFinite(options.retries) || options.retries < 0) {
        throw new Error(`Invalid --retries: ${options.retries}`);
    }

    const prod = uniq(prodDeps);
    const dev = uniq(devDeps);
    const dupAcross = overlap(prod, dev);

    if (dupAcross.length > 0) {
        console.warn(
            `Warning: ${dupAcross.length} package(s) appear in both prod and dev lists:\n${dupAcross.join(", ")}`
        );
    }

    const installForceArg = options.force ? ["--force"] : [];

    if (!options.skipInit) {
        ensureSafeToInit({ yes: options.yes });
        await runWithRetry(npmCmd, ["init", "-y"], options.retries, {
            timeoutMs: options.timeoutMs,
        });
    } else {
        console.log("Skipping npm init (--skip-init).");
    }

    if (prod.length > 0) {
        console.log(
            `\nInstalling ${prod.length} production dependencies${options.force ? " with --force" : ""}...`
        );
        await runWithRetry(
            npmCmd,
            [
                "install",
                ...installForceArg,
                ...prod,
            ],
            options.retries,
            { timeoutMs: options.timeoutMs }
        );
    } else {
        console.log("No production dependencies to install.");
    }

    if (dev.length > 0) {
        const chunks = chunkArray(dev, options.chunkSize);
        console.log(
            `\nInstalling ${dev.length} devDependencies in ${chunks.length} chunk(s) ` +
                `(chunk size: ${options.chunkSize})${options.force ? " with --force" : ""}...`
        );

        for (const [i, chunk] of chunks.entries()) {
            console.log(
                `\nInstalling dev chunk ${i + 1}/${chunks.length} (${chunk.length} packages)`
            );
            await runWithRetry(
                npmCmd,
                [
                    "install",
                    "-D",
                    ...installForceArg,
                    ...chunk,
                ],
                options.retries,
                { timeoutMs: options.timeoutMs }
            );
        }
    } else {
        console.log("No devDependencies to install.");
    }

    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\nDone in ${secs}s.`);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error("\nERROR:", err instanceof Error ? err.message : err);
        process.exit(1);
    });
