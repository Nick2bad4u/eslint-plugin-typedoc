declare function arrayFirst<TValue>(
    array: readonly TValue[]
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;

const firstStatus = arrayFirst(monitorStatuses);
const firstStatusAgain = arrayFirst(monitorStatuses);

if (firstStatus === firstStatusAgain && firstStatus === "up") {
    throw new TypeError("Unexpected array-first result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
