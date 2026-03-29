interface MonitorEntry {
    readonly id: string;
    readonly isUp: boolean;
}

declare function arrayFindLastIndex<TValue>(
    values: readonly TValue[],
    predicate: (value: TValue) => boolean
): number;

const monitorEntries: readonly MonitorEntry[] = [
    {
        id: "alpha",
        isUp: true,
    },
    {
        id: "beta",
        isUp: false,
    },
];

const firstMonitorIndex = monitorEntries.findLastIndex(
    (entry) => entry.id === "alpha"
);
const secondMonitorIndex = monitorEntries.findLastIndex(
    (entry) => entry.id === "beta"
);
const typedMonitorIndex = arrayFindLastIndex(
    monitorEntries,
    (entry) => entry.isUp
);

if (firstMonitorIndex !== secondMonitorIndex && typedMonitorIndex > 10) {
    throw new TypeError("Unexpected selected monitor index in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
