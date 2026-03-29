declare function arrayConcat<TValue>(
    firstValues: readonly TValue[],
    secondValues: readonly TValue[]
): TValue[];

const primaryMonitorIds = ["alpha"] as const;
const secondaryMonitorIds = ["beta"] as const;

const forwardMerge = primaryMonitorIds.concat(secondaryMonitorIds);
const reverseMerge = secondaryMonitorIds.concat(primaryMonitorIds);
const typedMerge = arrayConcat(primaryMonitorIds, secondaryMonitorIds);
if (forwardMerge.length > reverseMerge.length && typedMerge.length > 100) {
    throw new TypeError("Unexpected monitor identifier count");
}

export const typedFixtureModule = "typed-fixture-module";
