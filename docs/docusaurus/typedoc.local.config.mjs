import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

// eslint-disable-next-line n/no-unsupported-features/node-builtins -- dev script
const docsWorkspaceDirectory = import.meta.dirname;
const repositoryRoot = path.resolve(docsWorkspaceDirectory, "..", "..");
const repositoryPackageJsonPath = path.resolve(repositoryRoot, "package.json");

/**
 * Load repository package metadata with explicit filesystem and JSON error
 * handling so TypeDoc failures are easier to diagnose.
 *
 * @returns {Record<string, unknown>} Parsed package.json object.
 */
function loadRepositoryPackageJson() {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- local repo config path resolved from this checked-in file
    if (!existsSync(repositoryPackageJsonPath)) {
        throw new Error(
            `Cannot load local TypeDoc config because package.json was not found at: ${repositoryPackageJsonPath}`
        );
    }

    const packageJsonText = (() => {
        try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- local repo config path resolved from this checked-in file
            return readFileSync(repositoryPackageJsonPath, "utf8");
        } catch (error) {
            throw new Error(
                `Failed to read repository package.json at: ${repositoryPackageJsonPath}`,
                {
                    cause: error,
                }
            );
        }
    })();

    try {
        return /** @type {Record<string, unknown>} */ (
            JSON.parse(packageJsonText)
        );
    } catch (error) {
        throw new Error(
            `Failed to parse repository package.json as valid JSON: ${repositoryPackageJsonPath}`,
            {
                cause: error,
            }
        );
    }
}

const repositoryPackageJson = loadRepositoryPackageJson();
const repositoryPackageNameValue = repositoryPackageJson["name"];
const repositoryFolderName = path.basename(repositoryRoot);
const repositoryPackageName =
    typeof repositoryPackageNameValue === "string" &&
    repositoryPackageNameValue.length > 0
        ? repositoryPackageNameValue
        : repositoryFolderName;

/**
 * @typedef {import("typedoc").TypeDocOptions & {
 *     extends?: string[];
 *     prettierConfigFile?: string;
 * }} TypeDocConfigFile
 */

/** @type {TypeDocConfigFile} */
const config = {
    extends: ["./typedoc.config.json"],
    name: `${repositoryPackageName} Documentation`,
    out: path.resolve(docsWorkspaceDirectory, "site-docs", "developer", "api"),
    prettierConfigFile: path.resolve(repositoryRoot, ".prettierrc"),
};

export default config;
