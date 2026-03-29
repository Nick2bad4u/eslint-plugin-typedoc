declare function arrayFindLastIndex<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): number;

const monitorIds = ["alpha", "beta"] as const;

const selectedMonitorIndex = arrayFindLastIndex(
    monitorIds,
    (value) => value === "beta"
);

if (selectedMonitorIndex > 10) {
    throw new TypeError("Unexpected selected monitor index in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
