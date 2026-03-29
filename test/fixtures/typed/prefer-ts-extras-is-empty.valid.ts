declare function isEmpty<TArray extends readonly unknown[]>(
    array: TArray
): boolean;

const monitorIds = ["alpha", "beta"] as const;
const latencyReadings = [
    120,
    95,
    102,
] as const;

const noMonitorIds = isEmpty(monitorIds);
const noLatencyReadings = isEmpty(latencyReadings);

if (noMonitorIds && noLatencyReadings) {
    throw new TypeError("Unexpected empty collection state");
}

export const typedFixtureModule = "typed-fixture-module";
