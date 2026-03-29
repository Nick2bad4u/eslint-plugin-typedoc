declare function arrayFindLast<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): TValue | undefined;

const monitorIds = ["alpha", "beta"] as const;

const firstMonitorId = monitorIds.findLast((value) => value === "alpha");
const secondMonitorId = monitorIds.findLast((value) => value === "beta");
const typedMonitorId = arrayFindLast(monitorIds, (value) => value === "beta");

if (firstMonitorId !== secondMonitorId && typedMonitorId === "beta") {
    throw new TypeError("Unexpected selected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
