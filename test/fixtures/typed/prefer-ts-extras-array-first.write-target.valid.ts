const mutableLatencies = [
    120,
    95,
    102,
];

mutableLatencies[0] = 90;
mutableLatencies[0]++;

const literalKeyRecord = {
    0: "alpha",
    1: "beta",
} as const;
const firstRecordEntry = literalKeyRecord["0"];

const monitorStatuses = ["down", "up"] as const;
const secondStatus = monitorStatuses["1"];

const dynamicIndex = 0 as number;
const maybeFirstStatus = monitorStatuses[dynamicIndex];

export const typedFixtureModule =
    String(firstRecordEntry) + String(secondStatus) + String(maybeFirstStatus);
