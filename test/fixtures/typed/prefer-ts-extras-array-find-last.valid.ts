declare function arrayFindLast<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): TValue | undefined;

const monitorIds = ["alpha", "beta"] as const;

const selectedMonitorId = arrayFindLast(
    monitorIds,
    (value) => value === "beta"
);

if (selectedMonitorId === "alpha") {
    throw new TypeError("Unexpected selected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
