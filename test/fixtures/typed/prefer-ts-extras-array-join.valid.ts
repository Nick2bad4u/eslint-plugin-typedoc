declare function arrayJoin(
    values: readonly unknown[],
    separator: string
): string;

const monitorSegments = ["alpha", "up"] as const;

const monitorKey = arrayJoin(monitorSegments, ":");

if (monitorKey.length > 100) {
    throw new TypeError("Unexpected joined key length in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
