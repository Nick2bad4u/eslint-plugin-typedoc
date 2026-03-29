declare function arrayIncludes<TValue>(
    array: readonly TValue[],
    value: unknown
): value is TValue;

const monitorStatuses = ["down", "up"] as const;

declare const maybeStatus: string;

const hasKnownStatus = arrayIncludes(monitorStatuses, maybeStatus);

if (hasKnownStatus && maybeStatus === "up") {
    throw new TypeError("Unexpected known status in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
