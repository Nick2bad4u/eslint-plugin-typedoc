export interface IndexNowPayload {
    readonly host: string;
    readonly key: string;
    readonly keyLocation: string;
    readonly urlList: readonly string[];
}

export interface IndexNowSiteConfiguration {
    readonly host: string;
    readonly keyFileUrl: string;
    readonly siteUrl: string;
    readonly sitemapUrl: string;
}

export interface DocusaurusRouteManifestEntry {
    readonly permalink: string;
    readonly sourcePath: string;
}

export function ensureValidIndexNowKey(rawKey: string): string;

export function normalizeSiteUrl(rawSiteUrl: string): string;

export function deriveSiteConfiguration(
    rawSiteUrl: string,
    keyFileName?: string
): IndexNowSiteConfiguration;

export function decodeXmlEntities(value: string): string;

export function parseSitemapUrls(sitemapXml: string): readonly string[];

export function chunkValues<T>(
    values: readonly T[],
    batchSize: number
): readonly (readonly T[])[];

export function createIndexNowPayloads(input: {
    readonly batchSize?: number;
    readonly host: string;
    readonly key: string;
    readonly keyLocation: string;
    readonly urlList: readonly string[];
}): readonly IndexNowPayload[];

export function normalizeDocusaurusSourcePath(
    sourcePath: string
): string | undefined;

export function collectRouteManifestEntriesFromData(
    value: unknown,
    siteDirectory?: string
): readonly DocusaurusRouteManifestEntry[];

export function parseGitDiffNameStatus(diffText: string): readonly string[];

export function resolveChangedUrlsFromManifest(input: {
    readonly changedPaths: readonly string[];
    readonly manifestEntries: readonly DocusaurusRouteManifestEntry[];
    readonly siteUrl: string;
}): readonly string[];

export function isIndexNowVerificationPendingResponse(
    statusCode: number,
    responseText: string
): boolean;
