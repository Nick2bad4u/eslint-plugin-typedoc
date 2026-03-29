/**
 * Commitlint configuration for eslint-plugin-typefest.
 *
 * Enforces the repository's hybrid Gitmoji format, e.g.:
 *
 * - `✨ [feat] Add typed rule metadata`
 * - `🛠️ [fix](lint) Prevent parser crash on empty scope`
 * - `:sparkles: [feat] Add typed rule metadata`
 *
 * Structure: `<gitmoji> [type](scope?)?[:]? <subject>`
 *
 * @type {import("@commitlint/types").UserConfig}
 *
 * @typedef {import("@commitlint/types").UserConfig} CommitlintConfig
 *
 * @see {@link https://commitlint.js.org/ | Commitlint Documentation}
 * @see {@link https://www.conventionalcommits.org/ | Conventional Commits Specification}
 */

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isDependencyBumpCommit(commit) {
    return /^build\(deps.*\): bump/v.test(commit);
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isMergeCommit(commit) {
    return commit.includes("Merge");
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isReleaseCommit(commit) {
    return commit.startsWith("chore(release)");
}

/**
 * @param {string} commit
 *
 * @returns {boolean}
 */
function isRevertCommit(commit) {
    return commit.includes("Revert");
}

const hybridCommitTypes = [
    "build",
    "chore",
    "ci",
    "docs",
    "feat",
    "fix",
    "perf",
    "refactor",
    "revert",
    "style",
    "test",
];

const hybridCommitTypesSet = new Set(hybridCommitTypes);
const gitmojiUnicodePattern = /\p{Extended_Pictographic}/v;

/**
 * @param {string} header
 *
 * @returns {string}
 */
function getHeaderPrefixToken(header) {
    const firstSpaceIndex = header.indexOf(" ");

    if (firstSpaceIndex === -1) {
        return header;
    }

    return header.slice(0, firstSpaceIndex);
}

/**
 * @param {string} token
 *
 * @returns {boolean}
 */
function isGitmojiShortcodeToken(token) {
    if (!token.startsWith(":") || !token.endsWith(":")) {
        return false;
    }

    const body = token.slice(1, -1);

    if (body.length === 0) {
        return false;
    }

    return [...body].every((character) => {
        const isLowercaseLetter = character >= "a" && character <= "z";
        const isNumber = character >= "0" && character <= "9";

        return (
            isLowercaseLetter ||
            isNumber ||
            character === "_" ||
            character === "+" ||
            character === "-"
        );
    });
}

/**
 * @param {string} token
 *
 * @returns {boolean}
 */
function isGitmojiToken(token) {
    return isGitmojiShortcodeToken(token) || gitmojiUnicodePattern.test(token);
}

/**
 * @param {string} scope
 *
 * @returns {boolean}
 */
function isValidScope(scope) {
    if (scope.length === 0) {
        return false;
    }

    const [firstCharacter = ""] = scope;
    const isFirstCharacterValid =
        (firstCharacter >= "a" && firstCharacter <= "z") ||
        (firstCharacter >= "0" && firstCharacter <= "9");

    if (!isFirstCharacterValid) {
        return false;
    }

    return [...scope].every((character) => {
        const isLowercaseLetter = character >= "a" && character <= "z";
        const isNumber = character >= "0" && character <= "9";

        return (
            isLowercaseLetter ||
            isNumber ||
            character === "-" ||
            character === "/"
        );
    });
}

/**
 * @param {string} header
 *
 * @returns {{
 *     valid: boolean;
 *     reason: string;
 * }}
 */
function validateHybridHeader(header) {
    const firstSpaceIndex = header.indexOf(" ");

    if (firstSpaceIndex <= 0) {
        return {
            reason: "missing gitmoji prefix token",
            valid: false,
        };
    }

    const token = getHeaderPrefixToken(header);

    if (!isGitmojiToken(token)) {
        return {
            reason: "prefix token must be an emoji or :shortcode:",
            valid: false,
        };
    }

    const remainder = header.slice(firstSpaceIndex + 1);

    if (!remainder.startsWith("[")) {
        return {
            reason: "missing [type] marker",
            valid: false,
        };
    }

    const closingBracketIndex = remainder.indexOf("]");

    if (closingBracketIndex <= 1) {
        return {
            reason: "[type] marker is malformed",
            valid: false,
        };
    }

    const type = remainder.slice(1, closingBracketIndex);

    if (!hybridCommitTypesSet.has(type)) {
        return {
            reason: `unsupported commit type '${type}'`,
            valid: false,
        };
    }

    let cursor = closingBracketIndex + 1;

    if (remainder.charAt(cursor) === "(") {
        const scopeEndIndex = remainder.indexOf(")", cursor + 1);

        if (scopeEndIndex === -1) {
            return {
                reason: "scope is missing closing ')'",
                valid: false,
            };
        }

        const scope = remainder.slice(cursor + 1, scopeEndIndex);

        if (!isValidScope(scope)) {
            return {
                reason: "scope must be kebab-case (letters, numbers, '-' and '/')",
                valid: false,
            };
        }

        cursor = scopeEndIndex + 1;
    }

    if (remainder.charAt(cursor) === "!") {
        cursor += 1;
    }

    if (remainder.charAt(cursor) === ":") {
        cursor += 1;
    }

    if (remainder.charAt(cursor) !== " ") {
        return {
            reason: "missing space before commit subject",
            valid: false,
        };
    }

    const subject = remainder.slice(cursor + 1).trim();

    if (subject.length < 3) {
        return {
            reason: "subject must be at least 3 characters",
            valid: false,
        };
    }

    if (subject.endsWith(".")) {
        return {
            reason: "subject must not end with a period",
            valid: false,
        };
    }

    return {
        reason: "",
        valid: true,
    };
}

const commitlintConfig = /** @type {CommitlintConfig} */ ({
    $schema: "https://www.schemastore.org/commitlintrc.json",

    /**
     * Default ignore patterns.
     */
    defaultIgnores: true,

    /**
     * Help URL for commit format guidance.
     */
    helpUrl: "https://gitmoji.dev/",

    /**
     * Ignore certain commit patterns.
     */
    ignores: [
        isMergeCommit,
        isRevertCommit,
        isReleaseCommit,
        isDependencyBumpCommit,
    ],

    /**
     * Custom plugin rules.
     */
    plugins: [
        {
            rules: {
                /**
                 * @param {{ header?: string | null }} parsed
                 *
                 * @returns {[boolean, string]}
                 */
                "gitmoji-token-valid": (parsed) => {
                    const header = parsed.header?.trim() ?? "";

                    if (header.length === 0) {
                        return [false, "commit header must not be empty"];
                    }

                    const validationResult = validateHybridHeader(header);

                    return [
                        validationResult.valid,
                        `commit header must follow '<gitmoji> [type](scope?) subject' format (${validationResult.reason})`,
                    ];
                },
            },
        },
    ],

    /**
     * Prompt configuration for interactive usage.
     */
    prompt: {
        questions: {
            body: {
                description: "Provide a longer description of the change",
            },
            breaking: {
                description: "Describe the breaking changes",
            },
            breakingBody: {
                description:
                    "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
            },
            isBreaking: {
                description: "Are there any breaking changes?",
            },
            isIssueAffected: {
                description: "Does this change affect any open issues?",
            },
            issues: {
                description:
                    'Add issue references (e.g. "fix #123", "re #123")',
            },
            issuesBody: {
                description:
                    "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
            },
            scope: {
                description:
                    "What is the scope of this change (e.g. component, service, utils)",
            },
            subject: {
                description:
                    "Write a short, imperative tense description of the change",
            },
            type: {
                description:
                    "Select the type. Final header format: '✨ [type](scope?) subject'. Commitlint also accepts ':shortcode: [type] subject'.",
                enum: {
                    ":art: style": {
                        description:
                            "Changes that do not affect the meaning of the code",
                        emoji: "🎨",
                        title: "Styles",
                    },
                    ":broom: chore": {
                        description:
                            "Other changes that don't modify src or test files",
                        emoji: "🧹",
                        title: "Chores",
                    },
                    ":bug: fix": {
                        description: "A bug fix",
                        emoji: "🐛",
                        title: "Bug Fixes",
                    },
                    ":construction_worker: ci": {
                        description:
                            "Changes to our CI configuration files and scripts",
                        emoji: "👷",
                        title: "Continuous Integrations",
                    },
                    ":memo: docs": {
                        description: "Documentation only changes",
                        emoji: "📝",
                        title: "Documentation",
                    },
                    ":recycle: refactor": {
                        description:
                            "A code change that neither fixes a bug nor adds a feature",
                        emoji: "♻️",
                        title: "Code Refactoring",
                    },
                    ":rewind: revert": {
                        description: "Reverts a previous commit",
                        emoji: "⏪️",
                        title: "Reverts",
                    },
                    ":sparkles: feat": {
                        description: "A new feature",
                        emoji: "✨",
                        title: "Features",
                    },
                    ":white_check_mark: test": {
                        description:
                            "Adding missing tests or correcting existing tests",
                        emoji: "✅",
                        title: "Tests",
                    },

                    ":wrench: build": {
                        description:
                            "Changes that affect the build system or external dependencies",
                        emoji: "🔧",
                        title: "Builds",
                    },
                    ":zap: perf": {
                        description: "A code change that improves performance",
                        emoji: "⚡",
                        title: "Performance Improvements",
                    },
                },
            },
        },
    },

    /**
     * Custom rules for enhanced commit message validation.
     */
    rules: {
        "body-case": [
            1,
            "always",
            "sentence-case",
        ],

        // Body rules for detailed commits
        "body-leading-blank": [1, "always"],

        "body-max-line-length": [
            2,
            "always",
            160,
        ],

        // Footer rules for breaking changes and issue references
        "footer-leading-blank": [1, "always"],
        "footer-max-line-length": [
            2,
            "always",
            100,
        ],
        // Header rules
        "gitmoji-token-valid": [2, "always"],
        "header-max-length": [
            2,
            "always",
            100,
        ],
        "header-min-length": [
            2,
            "always",
            10,
        ],
        "header-trim": [2, "always"],
        // References for issue tracking integration
        "references-empty": [0, "never"],
        // Signed-off-by for contribution tracking (optional)
        //        "signed-off-by": [0, "never"],
        "subject-empty": [0, "never"],
    },
});

export default commitlintConfig;
