declare function arrayFirst<TValue>(
    array: readonly TValue[]
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;

const firstStatus = monitorStatuses["0"];
const firstStatusViaStringIndex = monitorStatuses["0"];
const typedFirstStatus = arrayFirst(monitorStatuses);

if (
    typeof typedFirstStatus === "string" &&
    firstStatus.length +
        firstStatusViaStringIndex.length +
        typedFirstStatus.length <
        0
) {
    throw new TypeError("Unexpected array-first result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
