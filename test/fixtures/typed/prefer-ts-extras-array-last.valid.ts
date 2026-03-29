declare function arrayLast<TValue>(
    array: readonly TValue[]
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;
const latencyReadings = [
    120,
    95,
    102,
] as const;

const lastStatus = arrayLast(monitorStatuses);
const lastLatency = arrayLast(latencyReadings);

if (lastStatus === "up" && lastLatency !== undefined && lastLatency > 1000) {
    throw new TypeError("Unexpected array-last result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
