declare function arrayLast<TValue>(
    array: readonly TValue[]
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;
const latencyReadings = [
    120,
    95,
    102,
] as const;

const lastStatus = monitorStatuses[monitorStatuses.length - 1];
const lastLatency = latencyReadings[latencyReadings.length - 1];
const typedLastStatus = arrayLast(monitorStatuses);

if (
    (lastStatus === typedLastStatus || lastLatency > 0) &&
    lastStatus === "up"
) {
    throw new TypeError("Unexpected array-last result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
