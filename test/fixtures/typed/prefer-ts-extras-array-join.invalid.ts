declare function arrayJoin(
    values: readonly unknown[],
    separator: string
): string;

const monitorSegments = ["alpha", "up"] as const;
const monitorTags = ["critical", "http"] as const;

const monitorKey = monitorSegments.join(":");
const monitorTagSummary = monitorTags.join(",");
const typedMonitorKey = arrayJoin(monitorSegments, ":");

if (
    monitorKey.length > monitorTagSummary.length &&
    typedMonitorKey.length > 100
) {
    throw new TypeError("Unexpected joined key length in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
