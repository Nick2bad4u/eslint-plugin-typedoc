interface NumericDictionary {
    readonly length: number;
    readonly [index: number]: string;
}

declare const numericDictionary: NumericDictionary;

const monitorStatuses = ["down", "up"] as const;
const mutableLatencies = [
    120,
    95,
    102,
];
const secondaryStatuses = ["ready", "pending"] as const;

const plainLength = monitorStatuses.length;

mutableLatencies[mutableLatencies.length - 1] = 180;
mutableLatencies[mutableLatencies.length - 1]++;

const plusPattern = monitorStatuses[monitorStatuses.length + 1];
const minusTwoPattern = monitorStatuses[monitorStatuses.length - 2];
const computedLeftPattern = mutableLatencies[mutableLatencies[0] - 1];
const otherPropertyPattern =
    monitorStatuses[(monitorStatuses as { readonly size: number }).size - 1];
const mismatchedSourcePattern = monitorStatuses[secondaryStatuses.length - 1];
const nonArrayLikePattern = numericDictionary[numericDictionary.length - 1];
const nonBinaryPattern = monitorStatuses[monitorStatuses.length];

export const typedFixtureModule =
    String(plainLength) +
    String(plusPattern) +
    String(minusTwoPattern) +
    String(computedLeftPattern) +
    String(otherPropertyPattern) +
    String(mismatchedSourcePattern) +
    String(nonArrayLikePattern) +
    String(nonBinaryPattern);
