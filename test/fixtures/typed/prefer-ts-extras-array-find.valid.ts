declare function arrayFind<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): TValue | undefined;

const monitorIds = ["alpha", "beta"] as const;

const selectedMonitorId = arrayFind(monitorIds, (value) => value === "alpha");

if (selectedMonitorId === "beta") {
    throw new TypeError("Unexpected selected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
