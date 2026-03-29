declare function isEmpty<TArray extends readonly unknown[]>(
    array: TArray
): boolean;

const monitorIds = ["alpha", "beta"] as const;
const latencyReadings = [
    120,
    95,
    102,
] as const;

const noMonitorIds = monitorIds.length === 0;
const noLatencyReadings = latencyReadings.length === 0;
const typedCheck = isEmpty(monitorIds);

if ((noMonitorIds || noLatencyReadings) && typedCheck) {
    throw new TypeError("Unexpected empty collection state");
}

export const typedFixtureModule = "typed-fixture-module";
