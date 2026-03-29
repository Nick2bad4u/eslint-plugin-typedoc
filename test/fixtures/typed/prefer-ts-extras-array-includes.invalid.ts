declare function arrayIncludes<TValue>(
    array: readonly TValue[],
    value: unknown
): value is TValue;

const monitorStatuses = ["down", "up"] as const;

declare const maybeStatus: "down" | "up";

const hasKnownStatus = monitorStatuses.includes("up");
const hasCandidateStatus = monitorStatuses.includes(maybeStatus);
const typedHasCandidateStatus = arrayIncludes(monitorStatuses, maybeStatus);

if (hasKnownStatus && (hasCandidateStatus || typedHasCandidateStatus)) {
    throw new TypeError("Unexpected known status in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
