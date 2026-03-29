import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { execFile as executeFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

/**
 * @typedef {(
 *     input: RequestInfo | URL,
 *     init?: RequestInit
 * ) => Promise<Response>} FetchImplementation
 */

/**
 * @typedef {{
 *     readonly host: string;
 *     readonly key: string;
 *     readonly keyLocation: string;
 *     readonly urlList: readonly string[];
 * }} IndexNowPayload
 */

/**
 * @typedef {{
 *     readonly host: string;
 *     readonly keyFileUrl: string;
 *     readonly siteUrl: string;
 *     readonly sitemapUrl: string;
 * }} IndexNowSiteConfiguration
 */

const DIRECTORY_NAME = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(DIRECTORY_NAME, "..");
const DEFAULT_BATCH_SIZE = 10_000;
const DEFAULT_ENDPOINT = "https://www.bing.com/indexnow";
const DEFAULT_CONTENT_PATHS = [
    "docs/rules",
    "docs/docusaurus/blog",
    "docs/docusaurus/site-docs",
    "docs/docusaurus/src/pages",
];
const DEFAULT_KEY_FILE_NAME = "indexnow-key.txt";
const DEFAULT_POLL_INTERVAL_MS = 15_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_SUBMISSION_POLL_INTERVAL_MS = 60_000;
const DEFAULT_SUBMISSION_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9\-]{8,128}$/v;
const LOC_CLOSE_TAG = "</loc>";
const LOC_OPEN_TAG = "<loc>";
const RETRYABLE_VERIFICATION_ERROR_CODE = "SiteVerificationNotCompleted";
const XML_ENTITY_PATTERN =
    /&(?:#(?<decimal>\d+)|#x(?<hexadecimal>[\dA-Fa-f]+)|(?<named>amp|apos|gt|lt|quot));/gu;
const executeFileAsync = promisify(executeFile);

/**
 * @typedef {{
 *     readonly permalink: string;
 *     readonly sourcePath: string;
 * }} DocusaurusRouteManifestEntry
 */

/**
 * Pause for the provided number of milliseconds.
 *
 * @param {number} durationMs
 *
 * @returns {Promise<void>}
 */
const delay = async (durationMs) => {
    await new Promise((resolve) => {
        setTimeout(resolve, durationMs);
    });
};

/**
 * Parse `--flag value` and `--flag=value` style CLI options.
 *
 * @param {readonly string[]} argv
 *
 * @returns {{
 *     readonly command: string | undefined;
 *     readonly options: ReadonlyMap<string, string>;
 * }}
 */
const parseCliArguments = (argv) => {
    /** @type {Map<string, string>} */
    const options = new Map();
    const [command, ...rawArguments] = argv;

    for (let index = 0; index < rawArguments.length; index += 1) {
        const rawArgument = rawArguments.at(index);

        if (!rawArgument?.startsWith("--")) {
            throw new Error(
                `Unexpected argument \`${rawArgument ?? "<missing>"}\`. Use --name value or --name=value options.`
            );
        }

        const argumentBody = rawArgument.slice(2);

        if (argumentBody.length === 0) {
            throw new Error("Encountered an empty CLI flag name.");
        }

        const separatorOffset = argumentBody.indexOf("=");

        if (separatorOffset !== -1) {
            const optionName = argumentBody.slice(0, separatorOffset);
            const optionValue = argumentBody.slice(separatorOffset + 1);

            if (optionValue.length === 0) {
                throw new Error(
                    `Option --${optionName} requires a non-empty value.`
                );
            }

            options.set(optionName, optionValue);
            continue;
        }

        const optionValue = rawArguments.at(index + 1);

        if (
            optionValue === undefined ||
            optionValue.length === 0 ||
            optionValue.startsWith("--")
        ) {
            throw new Error(
                `Option --${argumentBody} requires a following value.`
            );
        }

        options.set(argumentBody, optionValue);
        index += 1;
    }

    return {
        command,
        options,
    };
};

/**
 * Read an option value, preferring CLI arguments over environment variables.
 *
 * @param {ReadonlyMap<string, string>} options
 * @param {string} optionName
 * @param {string | undefined} environmentValue
 *
 * @returns {string | undefined}
 */
const readOption = (options, optionName, environmentValue) =>
    options.get(optionName) ?? environmentValue;

/**
 * Read a required option and fail with an actionable message when absent.
 *
 * @param {ReadonlyMap<string, string>} options
 * @param {string} optionName
 * @param {string | undefined} environmentValue
 * @param {string} environmentName
 *
 * @returns {string}
 */
const readRequiredOption = (
    options,
    optionName,
    environmentValue,
    environmentName
) => {
    const optionValue = readOption(options, optionName, environmentValue);

    if (optionValue === undefined || optionValue.trim().length === 0) {
        throw new Error(
            `Missing required option --${optionName} (or environment variable ${environmentName}).`
        );
    }

    return optionValue.trim();
};

/**
 * Determine whether a value is an object-like record.
 *
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * Read a string property from an arbitrary record.
 *
 * @param {Record<string, unknown>} value
 * @param {string} propertyName
 *
 * @returns {string | undefined}
 */
const readStringProperty = (value, propertyName) => {
    const propertyValue = value[propertyName];

    return typeof propertyValue === "string" ? propertyValue : undefined;
};

/**
 * Derive a route manifest entry candidate and dedupe key from a metadata node.
 *
 * @param {Record<string, unknown>} value
 * @param {string} siteDirectory
 *
 * @returns {{
 *           readonly dedupeKey: string;
 *           readonly entry: DocusaurusRouteManifestEntry;
 *       }
 *     | undefined}
 */
const createRouteManifestEntryCandidate = (value, siteDirectory) => {
    const source = readStringProperty(value, "source");
    const permalink = readStringProperty(value, "permalink");

    if (source === undefined || permalink === undefined) {
        return undefined;
    }

    const sourcePath = normalizeDocusaurusSourcePathForSiteDirectory(
        source,
        siteDirectory
    );

    if (sourcePath === undefined) {
        return undefined;
    }

    return {
        dedupeKey: `${sourcePath}::${permalink}`,
        entry: { permalink, sourcePath },
    };
};

/**
 * Find the next `&lt;loc&gt;...&lt;/loc&gt;` segment in a sitemap string.
 *
 * @param {string} sitemapXml
 * @param {number} searchStart
 *
 * @returns {{
 *           readonly rawLocation: string;
 *           readonly nextSearchStart: number;
 *       }
 *     | undefined}
 */
const findNextLocElementValue = (sitemapXml, searchStart) => {
    const openingTagOffset = sitemapXml.indexOf(LOC_OPEN_TAG, searchStart);

    if (openingTagOffset === -1) {
        return undefined;
    }

    const rawLocationStart = openingTagOffset + LOC_OPEN_TAG.length;
    const closingTagOffset = sitemapXml.indexOf(
        LOC_CLOSE_TAG,
        rawLocationStart
    );

    if (closingTagOffset === -1) {
        throw new Error(
            "Encountered a <loc> element without a closing </loc> tag in the sitemap."
        );
    }

    return {
        nextSearchStart: closingTagOffset + LOC_CLOSE_TAG.length,
        rawLocation: sitemapXml.slice(rawLocationStart, closingTagOffset),
    };
};

/**
 * Build the request init used for each IndexNow submission attempt.
 *
 * @param {IndexNowPayload} payload
 *
 * @returns {RequestInit}
 */
const createIndexNowSubmissionRequest = (payload) => ({
    body: JSON.stringify(payload),
    headers: {
        "content-type": "application/json; charset=utf-8",
    },
    method: "POST",
    signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
});

/**
 * Create a stable human-readable batch label for logs and errors.
 *
 * @param {number} payloadIndex
 * @param {number} payloadCount
 *
 * @returns {string}
 */
const createPayloadBatchLabel = (payloadIndex, payloadCount) =>
    `batch ${String(payloadIndex + 1)}/${String(payloadCount)}`;

/**
 * Report a successful IndexNow payload submission.
 *
 * @param {{
 *     readonly batchLabel: string;
 *     readonly urlCount: number;
 * }} options
 *
 * @returns {void}
 */
const logSuccessfulPayloadSubmission = ({ batchLabel, urlCount }) => {
    console.info(
        `Submitted IndexNow ${batchLabel} containing ${String(urlCount)} URLs.`
    );
};

/**
 * Throw when IndexNow verification has taken too long, otherwise log the retry
 * and wait before the next attempt.
 *
 * @param {{
 *     readonly attemptNumber: number;
 *     readonly batchLabel: string;
 *     readonly intervalMs: number;
 *     readonly responseText: string;
 *     readonly startedAt: number;
 *     readonly timeoutMs: number;
 * }} options
 *
 * @returns {Promise<void>}
 */
const waitForNextVerificationAttempt = async ({
    attemptNumber,
    batchLabel,
    intervalMs,
    responseText,
    startedAt,
    timeoutMs,
}) => {
    if (Date.now() - startedAt >= timeoutMs) {
        throw new Error(
            `IndexNow site verification did not complete within ${String(timeoutMs)}ms for ${batchLabel}. Last response body: ${responseText}`
        );
    }

    console.info(
        `IndexNow site verification is still pending for ${batchLabel} (attempt ${String(attemptNumber)}). Retrying in ${String(intervalMs)}ms.`
    );
    await delay(intervalMs);
};

/**
 * Create an actionable rejection error for a failed IndexNow submission.
 *
 * @param {{
 *     readonly batchLabel: string;
 *     readonly responseStatus: number;
 *     readonly responseText: string;
 * }} options
 *
 * @returns {Error}
 */
const createRejectedPayloadError = ({
    batchLabel,
    responseStatus,
    responseText,
}) => {
    const responseBodySuffix =
        responseText.length === 0 ? "" : ` Response body: ${responseText}`;

    return new Error(
        `IndexNow rejected ${batchLabel} with HTTP ${String(responseStatus)}.${responseBodySuffix}`
    );
};

/**
 * Parse a positive integer option.
 *
 * @param {string | undefined} rawValue
 * @param {number} defaultValue
 * @param {string} label
 *
 * @returns {number}
 */
const parsePositiveInteger = (rawValue, defaultValue, label) => {
    if (rawValue === undefined || rawValue.trim().length === 0) {
        return defaultValue;
    }

    const numericValue = Number.parseInt(rawValue, 10);

    if (!Number.isSafeInteger(numericValue) || numericValue <= 0) {
        throw new Error(`${label} must be a positive integer.`);
    }

    return numericValue;
};

/**
 * Parse an optional JSON string array option.
 *
 * @param {string | undefined} rawValue
 * @param {string} label
 *
 * @returns {readonly string[] | undefined}
 */
const parseOptionalStringArrayOption = (rawValue, label) => {
    if (rawValue === undefined || rawValue.trim().length === 0) {
        return undefined;
    }

    const parsedValue = JSON.parse(rawValue);

    if (
        !Array.isArray(parsedValue) ||
        !parsedValue.every(
            (value) => typeof value === "string" && value.trim().length > 0
        )
    ) {
        throw new Error(`${label} must be a JSON array of non-empty strings.`);
    }

    return parsedValue.map((value) => value.replaceAll("\\", "/"));
};

/**
 * Read the configured public site URL from package metadata when no explicit
 * CLI or environment value is provided.
 *
 * @param {string} siteDirectory
 *
 * @returns {Promise<string>}
 */
const readConfiguredSiteUrl = async (siteDirectory) => {
    const candidatePackageJsonPaths = [
        path.resolve(REPOSITORY_ROOT, siteDirectory, "package.json"),
        path.resolve(REPOSITORY_ROOT, "package.json"),
    ];

    for (const packageJsonPath of candidatePackageJsonPaths) {
        if (!existsSync(packageJsonPath)) {
            continue;
        }

        const parsedPackageJson = JSON.parse(
            await fs.readFile(packageJsonPath, "utf8")
        );

        if (
            typeof parsedPackageJson === "object" &&
            parsedPackageJson !== null &&
            "homepage" in parsedPackageJson &&
            typeof parsedPackageJson.homepage === "string" &&
            parsedPackageJson.homepage.trim().length > 0
        ) {
            return normalizeSiteUrl(parsedPackageJson.homepage);
        }
    }

    throw new Error(
        "Unable to infer the public site URL from package metadata. Provide --site-url or INDEXNOW_SITE_URL explicitly."
    );
};

/**
 * Validate the configured IndexNow key.
 *
 * @param {string} rawKey
 *
 * @returns {string}
 */
export const ensureValidIndexNowKey = (rawKey) => {
    const key = rawKey.trim();

    if (!INDEXNOW_KEY_PATTERN.test(key)) {
        throw new Error(
            "INDEXNOW_KEY must be 8-128 characters long and contain only letters, numbers, and dashes."
        );
    }

    return key;
};

/**
 * Normalize a public site URL for path joining.
 *
 * @param {string} rawSiteUrl
 *
 * @returns {string}
 */
export const normalizeSiteUrl = (rawSiteUrl) => {
    const siteUrl = new URL(rawSiteUrl);
    siteUrl.hash = "";
    siteUrl.search = "";
    siteUrl.pathname = siteUrl.pathname.endsWith("/")
        ? siteUrl.pathname
        : `${siteUrl.pathname}/`;

    return siteUrl.toString();
};

/**
 * Derive the public sitemap and key-file URLs from a deployed site URL.
 *
 * @param {string} rawSiteUrl
 * @param {string} [keyFileName] - Optional public key-file name. Defaults to
 *   `indexnow-key.txt`.
 *
 * @returns {IndexNowSiteConfiguration}
 */
export const deriveSiteConfiguration = (
    rawSiteUrl,
    keyFileName = DEFAULT_KEY_FILE_NAME
) => {
    const siteUrl = normalizeSiteUrl(rawSiteUrl);
    const normalizedSiteUrl = new URL(siteUrl);
    const normalizedKeyFileName = keyFileName.trim();

    if (normalizedKeyFileName.length === 0) {
        throw new Error("The IndexNow key file name must not be empty.");
    }

    return {
        host: normalizedSiteUrl.hostname,
        keyFileUrl: new URL(
            normalizedKeyFileName,
            normalizedSiteUrl
        ).toString(),
        sitemapUrl: new URL("sitemap.xml", normalizedSiteUrl).toString(),
        siteUrl,
    };
};

/**
 * Decode the XML entities that may appear inside sitemap URLs.
 *
 * @param {string} value
 *
 * @returns {string}
 */
export const decodeXmlEntities = (value) =>
    value.replaceAll(XML_ENTITY_PATTERN, (_, decimal, hexadecimal, named) => {
        if (decimal !== undefined) {
            return String.fromCodePoint(Number.parseInt(decimal, 10));
        }

        if (hexadecimal !== undefined) {
            return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
        }

        switch (named) {
            case "amp": {
                return "&";
            }

            case "apos": {
                return "'";
            }

            case "gt": {
                return ">";
            }

            case "lt": {
                return "<";
            }

            case "quot": {
                return '"';
            }

            default: {
                return "&";
            }
        }
    });

/**
 * Parse and deduplicate all `&lt;loc&gt;` entries from a sitemap.
 *
 * @remarks
 * Docusaurus emits a standard XML sitemap with raw URL text content inside
 * `&lt;loc&gt;` elements. We only need those URL values and deliberately keep
 * this parser constrained to the sitemap contract rather than introducing a
 * heavier XML dependency for one deterministic extraction step.
 *
 * @param {string} sitemapXml
 *
 * @returns {readonly string[]}
 */
export const parseSitemapUrls = (sitemapXml) => {
    /** @type {string[]} */
    const urls = [];
    const seenUrls = new Set();

    let searchStart = 0;

    while (true) {
        const locElementValue = findNextLocElementValue(
            sitemapXml,
            searchStart
        );

        if (locElementValue === undefined) {
            break;
        }

        searchStart = locElementValue.nextSearchStart;
        const rawLocation = locElementValue.rawLocation.trim();

        if (rawLocation.length === 0) {
            continue;
        }

        const decodedLocation = decodeXmlEntities(rawLocation);

        if (seenUrls.has(decodedLocation)) {
            continue;
        }

        seenUrls.add(decodedLocation);
        urls.push(decodedLocation);
    }

    if (urls.length === 0) {
        throw new Error(
            "No <loc> entries were found in the sitemap. Verify that the deployed sitemap is valid and publicly reachable."
        );
    }

    return urls;
};

/**
 * Split a list into stable batches.
 *
 * @template T - Element type being chunked into stable submission batches.
 *
 * @param {readonly T[]} values
 * @param {number} batchSize
 *
 * @returns {readonly (readonly T[])[]}
 */
export const chunkValues = (values, batchSize) => {
    if (!Number.isSafeInteger(batchSize) || batchSize <= 0) {
        throw new Error("batchSize must be a positive integer.");
    }

    /** @type {T[][]} */
    const chunks = [];

    for (let index = 0; index < values.length; index += batchSize) {
        chunks.push(values.slice(index, index + batchSize));
    }

    return chunks;
};

/**
 * Build the JSON payloads submitted to the IndexNow endpoint.
 *
 * @param {{
 *     readonly batchSize?: number;
 *     readonly host: string;
 *     readonly key: string;
 *     readonly keyLocation: string;
 *     readonly urlList: readonly string[];
 * }} options
 *
 * @returns {readonly IndexNowPayload[]}
 */
export const createIndexNowPayloads = ({
    batchSize = DEFAULT_BATCH_SIZE,
    host,
    key,
    keyLocation,
    urlList,
}) =>
    chunkValues(urlList, batchSize).map((urls) => ({
        host,
        key,
        keyLocation,
        urlList: urls,
    }));

/**
 * Normalize a Docusaurus `source` field into a repository-relative path.
 *
 * @param {string} sourcePath
 *
 * @returns {string | undefined}
 */
export const normalizeDocusaurusSourcePath = (sourcePath) =>
    normalizeDocusaurusSourcePathForSiteDirectory(
        sourcePath,
        "docs/docusaurus"
    );

/**
 * Normalize a Docusaurus `source` field into a repository-relative path using a
 * specific Docusaurus site directory.
 *
 * @param {string} sourcePath
 * @param {string} siteDirectory
 *
 * @returns {string | undefined}
 */
const normalizeDocusaurusSourcePathForSiteDirectory = (
    sourcePath,
    siteDirectory
) => {
    if (!sourcePath.startsWith("@site/")) {
        return undefined;
    }

    const resolvedSiteDirectoryPath = path.resolve(
        REPOSITORY_ROOT,
        siteDirectory
    );
    const sourceRelativePath = sourcePath.slice("@site/".length);
    const candidateAbsolutePath = path.resolve(
        resolvedSiteDirectoryPath,
        sourceRelativePath
    );
    const candidatePaths = [
        candidateAbsolutePath,
        candidateAbsolutePath.replace(/\.jsx$/u, ".tsx"),
        candidateAbsolutePath.replace(/\.js$/u, ".ts"),
    ];

    for (const candidatePath of candidatePaths) {
        if (!existsSync(candidatePath)) {
            continue;
        }

        return path
            .relative(REPOSITORY_ROOT, candidatePath)
            .replaceAll("\\", "/");
    }

    return undefined;
};

/**
 * Walk an arbitrary JSON value and collect objects that expose both `source`
 * and `permalink` string fields.
 *
 * @param {unknown} value
 * @param {string} [siteDirectory] - Docusaurus site directory relative to the
 *   repository root.
 *
 * @returns {readonly DocusaurusRouteManifestEntry[]}
 */
export const collectRouteManifestEntriesFromData = (
    value,
    siteDirectory = "docs/docusaurus"
) => {
    /** @type {DocusaurusRouteManifestEntry[]} */
    const entries = [];
    /** @type {unknown[]} */
    const stack = [value];
    const seenEntries = new Set();

    while (stack.length > 0) {
        const currentValue = stack.pop();

        if (Array.isArray(currentValue)) {
            stack.push(...currentValue);
            continue;
        }

        if (!isRecord(currentValue)) {
            continue;
        }

        const routeManifestEntryCandidate = createRouteManifestEntryCandidate(
            currentValue,
            siteDirectory
        );

        if (
            routeManifestEntryCandidate !== undefined &&
            !seenEntries.has(routeManifestEntryCandidate.dedupeKey)
        ) {
            seenEntries.add(routeManifestEntryCandidate.dedupeKey);
            entries.push(routeManifestEntryCandidate.entry);
        }

        stack.push(...Object.values(currentValue));
    }

    return entries.sort((leftEntry, rightEntry) =>
        leftEntry.sourcePath.localeCompare(rightEntry.sourcePath)
    );
};

/**
 * Parse `git diff --name-status` output into repository-relative paths that
 * represent changed public routes.
 *
 * @param {string} diffText
 *
 * @returns {readonly string[]}
 */
export const parseGitDiffNameStatus = (diffText) => {
    /** @type {string[]} */
    const paths = [];
    const seenPaths = new Set();

    for (const line of diffText.split(/\r?\n/u)) {
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0) {
            continue;
        }

        const fields = trimmedLine.split("\t");
        const status = fields[0] ?? "";

        if (
            status.startsWith("A") ||
            status.startsWith("C") ||
            status.startsWith("M")
        ) {
            const addedPath = fields.at(-1);

            if (addedPath !== undefined && !seenPaths.has(addedPath)) {
                seenPaths.add(addedPath);
                paths.push(addedPath.replaceAll("\\", "/"));
            }

            continue;
        }

        if (status.startsWith("R")) {
            const renamedPath = fields.at(-1);

            if (renamedPath !== undefined && !seenPaths.has(renamedPath)) {
                seenPaths.add(renamedPath);
                paths.push(renamedPath.replaceAll("\\", "/"));
            }
        }
    }

    return paths;
};

/**
 * Convert changed repository paths into canonical public URLs using a generated
 * route manifest.
 *
 * @param {{
 *     readonly changedPaths: readonly string[];
 *     readonly manifestEntries: readonly DocusaurusRouteManifestEntry[];
 *     readonly siteUrl: string;
 * }} options
 *
 * @returns {readonly string[]}
 */
export const resolveChangedUrlsFromManifest = ({
    changedPaths,
    manifestEntries,
    siteUrl,
}) => {
    const manifestBySourcePath = new Map(
        manifestEntries.map((entry) => [entry.sourcePath, entry.permalink])
    );
    /** @type {string[]} */
    const urls = [];
    const seenUrls = new Set();

    for (const changedPath of changedPaths) {
        const permalink = manifestBySourcePath.get(changedPath);

        if (permalink === undefined) {
            continue;
        }

        const absoluteUrl = new URL(
            permalink,
            normalizeSiteUrl(siteUrl)
        ).toString();

        if (seenUrls.has(absoluteUrl)) {
            continue;
        }

        seenUrls.add(absoluteUrl);
        urls.push(absoluteUrl);
    }

    return urls;
};

/**
 * Recursively collect JSON file paths under a directory.
 *
 * @param {string} directoryPath
 *
 * @returns {Promise<readonly string[]>}
 */
const collectJsonFilePaths = async (directoryPath) => {
    /** @type {string[]} */
    const filePaths = [];
    const directoryEntries = await fs.readdir(directoryPath, {
        withFileTypes: true,
    });

    for (const directoryEntry of directoryEntries) {
        const childPath = path.join(directoryPath, directoryEntry.name);

        if (directoryEntry.isDirectory()) {
            filePaths.push(...(await collectJsonFilePaths(childPath)));
            continue;
        }

        if (directoryEntry.isFile() && childPath.endsWith(".json")) {
            filePaths.push(childPath);
        }
    }

    return filePaths;
};

/**
 * Generate a source-to-permalink manifest from the built Docusaurus metadata.
 *
 * @param {{
 *     readonly siteDirectoryPath: string;
 *     readonly siteUrl: string;
 * }} options
 *
 * @returns {Promise<readonly DocusaurusRouteManifestEntry[]>}
 */
const createRouteManifestEntries = async ({ siteDirectoryPath, siteUrl }) => {
    const docusaurusMetadataDirectoryPath = path.join(
        siteDirectoryPath,
        ".docusaurus"
    );
    const sitePathnamePrefix = new URL(normalizeSiteUrl(siteUrl)).pathname;
    const jsonFilePaths = await collectJsonFilePaths(
        docusaurusMetadataDirectoryPath
    );
    /** @type {DocusaurusRouteManifestEntry[]} */
    const manifestEntries = [];
    const seenEntries = new Set();
    const normalizedSiteDirectory = path
        .relative(REPOSITORY_ROOT, siteDirectoryPath)
        .replaceAll("\\", "/");

    for (const jsonFilePath of jsonFilePaths) {
        const parsedJson = JSON.parse(await fs.readFile(jsonFilePath, "utf8"));
        const entries = collectRouteManifestEntriesFromData(
            parsedJson,
            normalizedSiteDirectory
        );

        for (const entry of entries) {
            if (!entry.permalink.startsWith(sitePathnamePrefix)) {
                continue;
            }

            const dedupeKey = `${entry.sourcePath}::${entry.permalink}`;

            if (seenEntries.has(dedupeKey)) {
                continue;
            }

            seenEntries.add(dedupeKey);
            manifestEntries.push(entry);
        }
    }

    return manifestEntries.sort((leftEntry, rightEntry) =>
        leftEntry.sourcePath.localeCompare(rightEntry.sourcePath)
    );
};

/**
 * Write the generated route manifest to disk for later use in the post-deploy
 * IndexNow job.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const writeRouteManifest = async (options) => {
    const outputPath = readRequiredOption(
        options,
        "output",
        process.env["INDEXNOW_ROUTE_MANIFEST_OUTPUT_PATH"],
        "INDEXNOW_ROUTE_MANIFEST_OUTPUT_PATH"
    );
    const siteDirectory =
        readOption(
            options,
            "site-directory",
            process.env["INDEXNOW_SITE_DIRECTORY"]
        )?.trim() ?? "docs/docusaurus";
    const siteUrl =
        readOption(
            options,
            "site-url",
            process.env["INDEXNOW_SITE_URL"]
        )?.trim() ?? (await readConfiguredSiteUrl(siteDirectory));
    const resolvedSiteDirectoryPath = path.resolve(
        REPOSITORY_ROOT,
        siteDirectory
    );
    const resolvedOutputPath = path.resolve(REPOSITORY_ROOT, outputPath);
    const manifestEntries = await createRouteManifestEntries({
        siteDirectoryPath: resolvedSiteDirectoryPath,
        siteUrl,
    });

    await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
    await fs.writeFile(
        resolvedOutputPath,
        `${JSON.stringify(manifestEntries, null, 2)}\n`,
        "utf8"
    );

    console.info(
        `Wrote IndexNow route manifest with ${String(manifestEntries.length)} entries to ${resolvedOutputPath}.`
    );
};

/**
 * Resolve added, modified, copied, or renamed content files from the git diff
 * range.
 *
 * @param {{
 *     readonly baseRef: string;
 *     readonly contentPaths: readonly string[];
 *     readonly headRef: string;
 * }} options
 *
 * @returns {Promise<readonly string[]>}
 */
const collectChangedPathsFromGit = async ({
    baseRef,
    contentPaths,
    headRef,
}) => {
    if (/^0+$/u.test(baseRef)) {
        console.info(
            "Skipping IndexNow delta submission because the push event does not expose a usable previous commit SHA."
        );
        return [];
    }

    const gitArguments = [
        "diff",
        "--name-status",
        "--find-renames",
        "--diff-filter=ACMR",
        baseRef,
        headRef,
    ];

    if (contentPaths.length > 0) {
        gitArguments.push("--", ...contentPaths);
    }

    const { stdout } = await executeFileAsync("git", gitArguments, {
        cwd: REPOSITORY_ROOT,
        maxBuffer: 10 * 1024 * 1024,
    });

    return parseGitDiffNameStatus(stdout);
};

/**
 * Submit only changed public URLs derived from the push diff.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const submitDelta = async (options) => {
    const baseRef = readRequiredOption(
        options,
        "base-ref",
        process.env["INDEXNOW_BASE_REF"],
        "INDEXNOW_BASE_REF"
    );
    const headRef = readRequiredOption(
        options,
        "head-ref",
        process.env["INDEXNOW_HEAD_REF"],
        "INDEXNOW_HEAD_REF"
    );
    const manifestPath = readRequiredOption(
        options,
        "manifest",
        process.env["INDEXNOW_ROUTE_MANIFEST_PATH"],
        "INDEXNOW_ROUTE_MANIFEST_PATH"
    );
    const siteDirectory =
        readOption(
            options,
            "site-directory",
            process.env["INDEXNOW_SITE_DIRECTORY"]
        )?.trim() ?? "docs/docusaurus";
    const siteUrl =
        readOption(
            options,
            "site-url",
            process.env["INDEXNOW_SITE_URL"]
        )?.trim() ?? (await readConfiguredSiteUrl(siteDirectory));
    const contentPaths =
        parseOptionalStringArrayOption(
            readOption(
                options,
                "content-paths-json",
                process.env["INDEXNOW_CONTENT_PATHS_JSON"]
            ),
            "IndexNow content paths"
        ) ?? DEFAULT_CONTENT_PATHS;
    const resolvedManifestPath = path.resolve(REPOSITORY_ROOT, manifestPath);
    /** @type {readonly DocusaurusRouteManifestEntry[]} */
    const manifestEntries = JSON.parse(
        await fs.readFile(resolvedManifestPath, "utf8")
    );
    const changedPaths = await collectChangedPathsFromGit({
        baseRef,
        contentPaths,
        headRef,
    });

    if (changedPaths.length === 0) {
        console.info(
            "No changed public-content files were found in the push diff. Skipping IndexNow submission."
        );
        return;
    }

    const changedUrls = resolveChangedUrlsFromManifest({
        changedPaths,
        manifestEntries,
        siteUrl,
    });

    if (changedUrls.length === 0) {
        console.info(
            "No changed public URLs were derived from the changed content files. Skipping IndexNow submission."
        );
        return;
    }

    console.info(
        `Resolved ${String(changedUrls.length)} changed public URL(s) from the push diff.`
    );

    const deltaOptions = new Map(options);
    deltaOptions.set("batch-size", String(changedUrls.length));
    deltaOptions.set("urls", JSON.stringify(changedUrls));

    await submitSpecificUrls(deltaOptions);
};

/**
 * Detect whether an IndexNow response indicates that site verification is still
 * pending and should be retried.
 *
 * @param {number} statusCode
 * @param {string} responseText
 *
 * @returns {boolean}
 */
export const isIndexNowVerificationPendingResponse = (
    statusCode,
    responseText
) => {
    if (statusCode !== 403) {
        return false;
    }

    if (responseText.includes(RETRYABLE_VERIFICATION_ERROR_CODE)) {
        return true;
    }

    try {
        const parsed = JSON.parse(responseText);

        return (
            typeof parsed === "object" &&
            parsed !== null &&
            "errorCode" in parsed &&
            parsed.errorCode === RETRYABLE_VERIFICATION_ERROR_CODE
        );
    } catch {
        return false;
    }
};

/**
 * Fetch text content from a URL with a bounded timeout.
 *
 * @param {FetchImplementation} fetchImplementation
 * @param {string} url
 *
 * @returns {Promise<Response>}
 */
const fetchWithTimeout = async (fetchImplementation, url) =>
    fetchImplementation(url, {
        headers: { accept: "application/json, application/xml, text/plain" },
        method: "GET",
        signal: AbortSignal.timeout(DEFAULT_REQUEST_TIMEOUT_MS),
    });

/**
 * Wait until the deployed key file is publicly reachable and contains the
 * expected key.
 *
 * @param {{
 *     readonly fetchImplementation?: FetchImplementation;
 *     readonly intervalMs?: number;
 *     readonly key: string;
 *     readonly keyFileUrl: string;
 *     readonly sitemapUrl: string;
 *     readonly timeoutMs?: number;
 * }} options
 *
 * @returns {Promise<string>}
 */
const waitForPublishedSiteArtifacts = async ({
    fetchImplementation = globalThis.fetch,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
    key,
    keyFileUrl,
    sitemapUrl,
    timeoutMs = DEFAULT_WAIT_TIMEOUT_MS,
}) => {
    const startedAt = Date.now();
    let attemptNumber = 1;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const keyResponse = await fetchWithTimeout(
                fetchImplementation,
                keyFileUrl
            );

            if (keyResponse.ok) {
                const publishedKey = (await keyResponse.text()).trim();

                if (publishedKey === key) {
                    const sitemapResponse = await fetchWithTimeout(
                        fetchImplementation,
                        sitemapUrl
                    );

                    if (sitemapResponse.ok) {
                        return await sitemapResponse.text();
                    }
                }
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.info(
                `IndexNow readiness check attempt ${String(attemptNumber)} failed: ${message}`
            );
        }

        console.info(
            `Waiting for GitHub Pages to publish IndexNow assets (attempt ${String(
                attemptNumber
            )}).`
        );
        attemptNumber += 1;
        await delay(intervalMs);
    }

    throw new Error(
        `Timed out after ${String(timeoutMs)}ms waiting for ${keyFileUrl} and ${sitemapUrl} to become publicly reachable.`
    );
};

/**
 * Submit the prepared IndexNow payloads.
 *
 * @param {{
 *     readonly endpoint: string;
 *     readonly fetchImplementation?: FetchImplementation;
 *     readonly intervalMs?: number;
 *     readonly payloads: readonly IndexNowPayload[];
 *     readonly timeoutMs?: number;
 * }} options
 *
 * @returns {Promise<void>}
 */
const submitPayloads = async ({
    endpoint,
    fetchImplementation = globalThis.fetch,
    intervalMs = DEFAULT_SUBMISSION_POLL_INTERVAL_MS,
    payloads,
    timeoutMs = DEFAULT_SUBMISSION_TIMEOUT_MS,
}) => {
    for (const [payloadIndex, payload] of payloads.entries()) {
        const batchLabel = createPayloadBatchLabel(
            payloadIndex,
            payloads.length
        );
        const startedAt = Date.now();
        let attemptNumber = 1;

        while (true) {
            const response = await fetchImplementation(
                endpoint,
                createIndexNowSubmissionRequest(payload)
            );
            const responseText = (await response.text()).trim();

            if (response.ok) {
                logSuccessfulPayloadSubmission({
                    batchLabel,
                    urlCount: payload.urlList.length,
                });
                break;
            }

            if (
                !isIndexNowVerificationPendingResponse(
                    response.status,
                    responseText
                )
            ) {
                throw createRejectedPayloadError({
                    batchLabel,
                    responseStatus: response.status,
                    responseText,
                });
            }

            await waitForNextVerificationAttempt({
                attemptNumber,
                batchLabel,
                intervalMs,
                responseText,
                startedAt,
                timeoutMs,
            });
            attemptNumber += 1;
        }
    }
};

/**
 * Write the public key verification file into the already-built site output.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const writeKeyFile = async (options) => {
    const key = ensureValidIndexNowKey(
        readRequiredOption(
            options,
            "key",
            process.env["INDEXNOW_KEY"],
            "INDEXNOW_KEY"
        )
    );
    const outputPath = readRequiredOption(
        options,
        "output",
        process.env["INDEXNOW_OUTPUT_PATH"],
        "INDEXNOW_OUTPUT_PATH"
    );
    const resolvedOutputPath = path.resolve(REPOSITORY_ROOT, outputPath);

    await fs.mkdir(path.dirname(resolvedOutputPath), { recursive: true });
    await fs.writeFile(resolvedOutputPath, key, "utf8");

    console.info(`Wrote IndexNow key file to ${resolvedOutputPath}.`);
};

/**
 * Submit a specific set of URLs after verifying that the public key file is
 * available on the deployed site.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const submitSpecificUrls = async (options) => {
    const key = ensureValidIndexNowKey(
        readRequiredOption(
            options,
            "key",
            process.env["INDEXNOW_KEY"],
            "INDEXNOW_KEY"
        )
    );
    const endpoint =
        readOption(
            options,
            "endpoint",
            process.env["INDEXNOW_ENDPOINT"]
        )?.trim() ?? DEFAULT_ENDPOINT;
    const keyFileName =
        readOption(
            options,
            "key-file-name",
            process.env["INDEXNOW_KEY_FILE_NAME"]
        )?.trim() ?? DEFAULT_KEY_FILE_NAME;
    const siteDirectory =
        readOption(
            options,
            "site-directory",
            process.env["INDEXNOW_SITE_DIRECTORY"]
        )?.trim() ?? "docs/docusaurus";
    const siteUrl =
        readOption(
            options,
            "site-url",
            process.env["INDEXNOW_SITE_URL"]
        )?.trim() ?? (await readConfiguredSiteUrl(siteDirectory));
    const batchSize = parsePositiveInteger(
        readOption(options, "batch-size", process.env["INDEXNOW_BATCH_SIZE"]),
        DEFAULT_BATCH_SIZE,
        "IndexNow batch size"
    );
    const intervalMs = parsePositiveInteger(
        readOption(
            options,
            "poll-interval-ms",
            process.env["INDEXNOW_POLL_INTERVAL_MS"]
        ),
        DEFAULT_POLL_INTERVAL_MS,
        "IndexNow poll interval"
    );
    const timeoutMs = parsePositiveInteger(
        readOption(options, "timeout-ms", process.env["INDEXNOW_TIMEOUT_MS"]),
        DEFAULT_WAIT_TIMEOUT_MS,
        "IndexNow readiness timeout"
    );
    const submissionIntervalMs = parsePositiveInteger(
        readOption(
            options,
            "submission-poll-interval-ms",
            process.env["INDEXNOW_SUBMISSION_POLL_INTERVAL_MS"]
        ),
        DEFAULT_SUBMISSION_POLL_INTERVAL_MS,
        "IndexNow submission poll interval"
    );
    const submissionTimeoutMs = parsePositiveInteger(
        readOption(
            options,
            "submission-timeout-ms",
            process.env["INDEXNOW_SUBMISSION_TIMEOUT_MS"]
        ),
        DEFAULT_SUBMISSION_TIMEOUT_MS,
        "IndexNow submission timeout"
    );
    const urlsJson = readRequiredOption(
        options,
        "urls",
        process.env["INDEXNOW_URLS_JSON"],
        "INDEXNOW_URLS_JSON"
    );
    /** @type {readonly string[]} */
    const urlList = JSON.parse(urlsJson);
    const siteConfiguration = deriveSiteConfiguration(siteUrl, keyFileName);

    await waitForPublishedSiteArtifacts({
        intervalMs,
        key,
        keyFileUrl: siteConfiguration.keyFileUrl,
        sitemapUrl: siteConfiguration.sitemapUrl,
        timeoutMs,
    });

    const payloads = createIndexNowPayloads({
        batchSize,
        host: siteConfiguration.host,
        key,
        keyLocation: siteConfiguration.keyFileUrl,
        urlList,
    });

    console.info(
        `Submitting ${String(urlList.length)} URL(s) across ${String(payloads.length)} IndexNow batch(es).`
    );
    await submitPayloads({
        endpoint,
        intervalMs: submissionIntervalMs,
        payloads,
        timeoutMs: submissionTimeoutMs,
    });
};

/**
 * Fetch the deployed sitemap, derive the IndexNow payloads, and submit them.
 *
 * @param {ReadonlyMap<string, string>} options
 *
 * @returns {Promise<void>}
 */
const submitSitemap = async (options) => {
    const siteDirectory =
        readOption(
            options,
            "site-directory",
            process.env["INDEXNOW_SITE_DIRECTORY"]
        )?.trim() ?? "docs/docusaurus";
    const siteUrl =
        readOption(
            options,
            "site-url",
            process.env["INDEXNOW_SITE_URL"]
        )?.trim() ?? (await readConfiguredSiteUrl(siteDirectory));
    const endpoint =
        readOption(
            options,
            "endpoint",
            process.env["INDEXNOW_ENDPOINT"]
        )?.trim() ?? DEFAULT_ENDPOINT;

    console.info(
        `Preparing IndexNow submission for ${normalizeSiteUrl(siteUrl)} via ${endpoint}.`
    );

    const key = ensureValidIndexNowKey(
        readRequiredOption(
            options,
            "key",
            process.env["INDEXNOW_KEY"],
            "INDEXNOW_KEY"
        )
    );
    const keyFileName =
        readOption(
            options,
            "key-file-name",
            process.env["INDEXNOW_KEY_FILE_NAME"]
        )?.trim() ?? DEFAULT_KEY_FILE_NAME;
    const intervalMs = parsePositiveInteger(
        readOption(
            options,
            "poll-interval-ms",
            process.env["INDEXNOW_POLL_INTERVAL_MS"]
        ),
        DEFAULT_POLL_INTERVAL_MS,
        "IndexNow poll interval"
    );
    const timeoutMs = parsePositiveInteger(
        readOption(options, "timeout-ms", process.env["INDEXNOW_TIMEOUT_MS"]),
        DEFAULT_WAIT_TIMEOUT_MS,
        "IndexNow readiness timeout"
    );
    const siteConfiguration = deriveSiteConfiguration(siteUrl, keyFileName);
    const sitemapXml = await waitForPublishedSiteArtifacts({
        intervalMs,
        key,
        keyFileUrl: siteConfiguration.keyFileUrl,
        sitemapUrl: siteConfiguration.sitemapUrl,
        timeoutMs,
    });
    const urlList = parseSitemapUrls(sitemapXml);
    const specificUrlOptions = new Map(options);

    specificUrlOptions.set("urls", JSON.stringify(urlList));
    await submitSpecificUrls(specificUrlOptions);
};

/**
 * Execute the CLI entrypoint.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
    const { command, options } = parseCliArguments(process.argv.slice(2));

    switch (command) {
        case "submit-delta": {
            await submitDelta(options);
            return;
        }

        case "submit-sitemap": {
            await submitSitemap(options);
            return;
        }

        case "write-route-manifest": {
            await writeRouteManifest(options);
            return;
        }

        case "write-key-file": {
            await writeKeyFile(options);
            return;
        }

        default: {
            throw new Error(
                "Unknown command. Use `submit-delta`, `submit-sitemap`, `write-key-file`, or `write-route-manifest`."
            );
        }
    }
};

if (
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    await main().catch((error) => {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(`IndexNow automation failed: ${errorMessage}`);
        process.exitCode = 1;
    });
}
