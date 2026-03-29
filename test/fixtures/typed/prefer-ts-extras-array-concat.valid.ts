declare function arrayConcat<TValue>(
    firstValues: readonly TValue[],
    secondValues: readonly TValue[]
): TValue[];

const primaryMonitorIds = ["alpha"] as const;
const secondaryMonitorIds = ["beta"] as const;

const allMonitorIds = arrayConcat(primaryMonitorIds, secondaryMonitorIds);
if (allMonitorIds.length > 100) {
    throw new TypeError("Unexpected monitor identifier count");
}

export const typedFixtureModule = "typed-fixture-module";
