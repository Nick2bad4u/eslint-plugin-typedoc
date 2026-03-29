declare function arrayFind<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): TValue | undefined;

const monitorIds = ["alpha", "beta"] as const;

const firstMonitorId = monitorIds.find((value) => value === "alpha");
const secondMonitorId = monitorIds.find((value) => value === "beta");
const typedMonitorId = arrayFind(monitorIds, (value) => value === "alpha");

if (firstMonitorId !== secondMonitorId && typedMonitorId === "alpha") {
    throw new TypeError("Unexpected selected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
