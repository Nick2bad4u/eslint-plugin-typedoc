declare function arrayAt<TValue>(
    array: readonly TValue[],
    index: number
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;

const firstStatus = monitorStatuses.at(0);
const lastStatus = monitorStatuses.at(-1);
const typedLastStatus = arrayAt(monitorStatuses, -1);

if (
    (firstStatus === lastStatus || firstStatus === typedLastStatus) &&
    firstStatus === "up"
) {
    throw new TypeError("Unexpected arrayAt result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
