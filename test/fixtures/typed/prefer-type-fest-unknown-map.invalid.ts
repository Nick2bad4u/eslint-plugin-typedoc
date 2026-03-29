type MonitorPayloadMap = ReadonlyMap<unknown, unknown>;
type SiteMetaMap = ReadonlyMap<unknown, unknown>;

declare const monitorPayloadMap: MonitorPayloadMap;
declare const siteMetaMap: SiteMetaMap;

if (
    monitorPayloadMap.size === siteMetaMap.size &&
    monitorPayloadMap.size > 999
) {
    throw new TypeError("Unexpectedly large monitor payload map");
}

export const __typedFixtureModule = "typed-fixture-module";
