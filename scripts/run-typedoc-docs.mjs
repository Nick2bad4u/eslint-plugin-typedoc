import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const typedocPackageJsonPath = require.resolve("typedoc/package.json");
const typedocCliPath = resolve(
    dirname(typedocPackageJsonPath),
    "bin",
    "typedoc"
);
const windowsSystemRoot =
    process.env["SystemRoot"] ?? process.env["WINDIR"] ?? "C:\\Windows";
const substExecutablePath = resolve(windowsSystemRoot, "System32", "subst.exe");

/**
 * Parse a `--config FILE` (or `--options FILE`) argument from CLI args.
 *
 * @param {readonly string[]} cliArgs - Raw process arguments after the script
 *   path.
 *
 * @returns {string} TypeDoc options file name to pass to `typedoc --options`.
 */
function getConfigFileName(cliArgs) {
    for (let index = 0; index < cliArgs.length; index += 1) {
        const argument = cliArgs[index];
        if (argument !== "--config" && argument !== "--options") {
            continue;
        }

        const nextIndex = index + 1;
        if (nextIndex >= cliArgs.length) {
            throw new Error(`Missing value for CLI argument: ${argument}`);
        }

        const nextValue = cliArgs[nextIndex];
        if (typeof nextValue !== "string" || nextValue.length === 0) {
            throw new Error(`Missing value for CLI argument: ${argument}`);
        }

        return nextValue;
    }

    return "typedoc.config.json";
}

/**
 * Resolve the nearest hoisted/local TypeDoc CLI executable by walking up from
 * cwd.
 *
 * @param {string} cwd - Starting directory for lookup.
 *
 * @returns {string} Path to a TypeDoc CLI script.
 */
function resolveTypedocCliFromCwd(cwd) {
    let currentPath = cwd;

    while (true) {
        const candidatePath = resolve(
            currentPath,
            "node_modules",
            "typedoc",
            "bin",
            "typedoc"
        );

        if (existsSync(candidatePath)) {
            return candidatePath;
        }

        const parentPath = dirname(currentPath);

        if (parentPath === currentPath) {
            break;
        }

        currentPath = parentPath;
    }

    return typedocCliPath;
}

/**
 * Execute TypeDoc with the provided options file in a specific working
 * directory.
 *
 * @param {string} cwd - Working directory for the TypeDoc process.
 * @param {string} configFile - TypeDoc options file to pass to `--options`.
 */
function runTypedoc(cwd, configFile) {
    const resolvedTypedocCliPath = resolveTypedocCliFromCwd(cwd);

    execFileSync(
        process.execPath,
        [
            resolvedTypedocCliPath,
            "--options",
            configFile,
        ],
        {
            cwd,
            stdio: "inherit",
        }
    );
}

/**
 * Normalize a Windows path for case-insensitive comparison.
 *
 * @param {string} filePath - Path to normalize.
 *
 * @returns {string} Normalized path suitable for equality checks.
 */
function normalizeWindowsPath(filePath) {
    return resolve(filePath)
        .replace(/[\\/]+$/u, "")
        .toLowerCase();
}

/**
 * List active `subst` mappings.
 *
 * @returns {ReadonlyArray<{ driveRoot: string; targetPath: string }>} Active
 *   drive mappings.
 */
function getSubstMappings() {
    const output = execFileSync(substExecutablePath, {
        encoding: "utf8",
        stdio: [
            "ignore",
            "pipe",
            "ignore",
        ],
    });

    /** @type {{ driveRoot: string; targetPath: string }[]} */
    const mappings = [];

    for (const rawLine of output.split(/\r?\n/u)) {
        const line = rawLine.trim();

        if (line.length === 0) {
            continue;
        }

        const driveLetter = line[0];

        if (driveLetter === undefined) {
            continue;
        }

        const driveLetterCode = driveLetter.charCodeAt(0);

        if (driveLetterCode < 65 || driveLetterCode > 90) {
            continue;
        }

        if (!line.startsWith(":\\: => ", 1)) {
            continue;
        }

        const targetPath = line.slice(8).trim();

        if (targetPath.length === 0) {
            continue;
        }

        mappings.push({
            driveRoot: `${driveLetter}:`,
            targetPath,
        });
    }

    return mappings;
}

/**
 * Remove a `subst` mapping if it exists.
 *
 * @param {string} driveRoot - Drive root such as `X:`.
 */
function removeSubstDrive(driveRoot) {
    if (
        !getSubstMappings().some(
            ({ driveRoot: mappedDriveRoot }) => mappedDriveRoot === driveRoot
        )
    ) {
        return;
    }

    execFileSync(substExecutablePath, [driveRoot, "/d"], {
        stdio: "ignore",
    });
}

/**
 * Remove stale temporary `subst` mappings previously created for this
 * repository root.
 *
 * @param {string} repositoryRoot - Absolute repository root directory.
 */
function removeStaleRepositorySubstMappings(repositoryRoot) {
    const normalizedRepositoryRoot = normalizeWindowsPath(repositoryRoot);

    for (const { driveRoot, targetPath } of getSubstMappings()) {
        if (normalizeWindowsPath(targetPath) !== normalizedRepositoryRoot) {
            continue;
        }

        removeSubstDrive(driveRoot);
    }
}

/**
 * Register cleanup handlers so a temporary `subst` mapping is removed on common
 * process termination paths.
 *
 * @param {string} driveRoot - Drive root such as `X:`.
 *
 * @returns {() => void} Disposer that removes listeners and performs cleanup.
 */
function registerTemporaryDriveCleanup(driveRoot) {
    let isCleanedUp = false;

    const cleanupOnce = () => {
        if (isCleanedUp) {
            return;
        }

        isCleanedUp = true;

        try {
            removeSubstDrive(driveRoot);
        } catch (error) {
            console.warn(
                `Warning: failed to remove temporary subst drive ${driveRoot}: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    };

    /** @type {(() => void)[]} */
    const removeListeners = [];

    /**
     * @param {NodeJS.Signals | "exit"} eventName - Process event name.
     * @param {() => void} handler - Listener to register.
     */
    const addListener = (eventName, handler) => {
        process.on(eventName, handler);
        removeListeners.push(() => {
            process.off(eventName, handler);
        });
    };

    addListener("exit", cleanupOnce);
    addListener("SIGINT", () => {
        cleanupOnce();
        process.exit(130);
    });
    addListener("SIGTERM", () => {
        cleanupOnce();
        process.exit(143);
    });

    return () => {
        cleanupOnce();

        for (const removeListener of removeListeners) {
            removeListener();
        }
    };
}

/**
 * Pick an unused drive letter suitable for a temporary `subst` mapping.
 *
 * @returns {string} Drive letter (without colon).
 */
function getTemporaryDriveLetter() {
    const candidateLetters = [
        "Z",
        "Y",
        "X",
        "W",
        "V",
        "U",
        "T",
        "S",
        "R",
    ];

    for (const letter of candidateLetters) {
        if (!existsSync(`${letter}:\\`)) {
            return letter;
        }
    }

    throw new Error(
        "No free temporary drive letter was found for TypeDoc subst mapping."
    );
}

/**
 * Run TypeDoc from a temporary subst drive to avoid escaped-parentheses path
 * bugs on Windows.
 *
 * @param {string} repositoryRoot - Absolute repository root directory.
 * @param {string} docsWorkspaceRelativePath - Docs workspace relative path from
 *   the repository root.
 * @param {string} configFile - TypeDoc options file name to use.
 */
function runViaTemporaryDrive(
    repositoryRoot,
    docsWorkspaceRelativePath,
    configFile
) {
    removeStaleRepositorySubstMappings(repositoryRoot);

    const driveLetter = getTemporaryDriveLetter();
    const driveRoot = `${driveLetter}:`;

    execFileSync(substExecutablePath, [driveRoot, repositoryRoot], {
        stdio: "ignore",
    });

    const disposeCleanup = registerTemporaryDriveCleanup(driveRoot);

    try {
        const mappedDocsWorkspaceDirectory = resolve(
            `${driveRoot}\\`,
            docsWorkspaceRelativePath
        );
        runTypedoc(mappedDocsWorkspaceDirectory, configFile);
    } finally {
        disposeCleanup();
    }
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const docsWorkspaceDirectory = resolve(repositoryRoot, "docs", "docusaurus");
const docsWorkspaceRelativePath = relative(
    repositoryRoot,
    docsWorkspaceDirectory
);
const configFile = getConfigFileName(process.argv.slice(2));

if (process.platform === "win32" && /[()]/u.test(repositoryRoot)) {
    runViaTemporaryDrive(repositoryRoot, docsWorkspaceRelativePath, configFile);
} else {
    runTypedoc(docsWorkspaceDirectory, configFile);
}
