import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const repositoryPackageJsonPath = resolve(repositoryRoot, "package.json");
const outputPath = resolve(
    repositoryRoot,
    "docs",
    "docusaurus",
    "static",
    ".well-known",
    "appspecific",
    "com.chrome.devtools.json"
);
const outputDirectory = dirname(outputPath);
const shouldRegenerateUuid = process.argv.includes("--regenerate");

/**
 * Load the repository package.json contents with explicit filesystem and JSON
 * parse error handling.
 *
 * @returns {Record<string, unknown>} Parsed package.json object.
 */
function loadRepositoryPackageJson() {
    if (!existsSync(repositoryPackageJsonPath)) {
        throw new Error(
            `Cannot generate DevTools workspace metadata because package.json was not found at: ${repositoryPackageJsonPath}`
        );
    }

    let packageJsonText;

    try {
        packageJsonText = readFileSync(repositoryPackageJsonPath, "utf8");
    } catch (error) {
        throw new Error(
            `Failed to read repository package.json at: ${repositoryPackageJsonPath}`,
            {
                cause: error,
            }
        );
    }

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

/**
 * Read the existing metadata UUID if present and valid.
 *
 * @returns {string | undefined} Existing UUID value.
 */
function readExistingUuid() {
    if (!existsSync(outputPath)) {
        return undefined;
    }

    try {
        const existingConfig = JSON.parse(readFileSync(outputPath, "utf8"));
        const existingUuid = existingConfig?.workspace?.uuid;

        return typeof existingUuid === "string" && existingUuid.length > 0
            ? existingUuid
            : undefined;
    } catch {
        return undefined;
    }
}

try {
    const repositoryPackageJson = loadRepositoryPackageJson();
    const repositoryPackageName = repositoryPackageJson["name"];
    const workspaceUuid = shouldRegenerateUuid
        ? randomUUID()
        : (readExistingUuid() ?? randomUUID());
    const packageName =
        typeof repositoryPackageName === "string" &&
        repositoryPackageName.length > 0
            ? repositoryPackageName
            : basename(repositoryRoot);
    const metadataJson = `${JSON.stringify(
        {
            workspace: {
                root: repositoryRoot.replaceAll("\\", "/"),
                uuid: workspaceUuid,
            },
        },
        null,
        4
    )}\n`;

    try {
        mkdirSync(outputDirectory, { recursive: true });
        writeFileSync(outputPath, metadataJson);
    } catch (error) {
        throw new Error(
            `Failed to write DevTools workspace metadata file at: ${outputPath}`,
            {
                cause: error,
            }
        );
    }

    console.log(`Wrote Chrome DevTools workspace metadata for ${packageName}.`);
    console.log(`Metadata file: ${outputPath}`);
    console.log(`Workspace root: ${repositoryRoot}`);
    console.log(`Workspace UUID: ${workspaceUuid}`);
    console.log(
        "Use `npm run docs:start:devtools` to serve the Docusaurus site on localhost with the metadata file available at /.well-known/appspecific/com.chrome.devtools.json."
    );
    console.log(
        "Pass --regenerate to assign a new UUID (note: that disconnects any previously connected DevTools workspace for this checkout)."
    );
} catch (error) {
    const message =
        error instanceof Error
            ? error.message
            : String(error ?? "Unknown error");

    console.error(message);
    process.exitCode = 1;
}
