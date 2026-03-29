declare function arrayAt<TValue>(
    array: readonly TValue[],
    index: number
): TValue | undefined;

const monitorStatuses = ["down", "up"] as const;

const firstStatus = arrayAt(monitorStatuses, 0);
const lastStatus = arrayAt(monitorStatuses, -1);

if (firstStatus === lastStatus && firstStatus === "up") {
    throw new TypeError("Unexpected arrayAt result in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
