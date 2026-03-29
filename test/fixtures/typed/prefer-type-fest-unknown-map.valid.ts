import type { UnknownMap } from "type-fest";

type MonitorPayloadMap = UnknownMap;
type SiteMetaMap = UnknownMap;

declare const monitorPayloadMap: MonitorPayloadMap;
declare const siteMetaMap: SiteMetaMap;

if (
    monitorPayloadMap.size === siteMetaMap.size &&
    monitorPayloadMap.size > 999
) {
    throw new TypeError("Unexpectedly large monitor payload map");
}

export const __typedFixtureModule = "typed-fixture-module";
