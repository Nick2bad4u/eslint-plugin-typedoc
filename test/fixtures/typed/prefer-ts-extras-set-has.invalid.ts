declare function setHas<TValue>(
    set: ReadonlySet<TValue>,
    value: unknown
): value is TValue;

const monitorIds = new Set(["alpha", "beta"] as const);

declare const candidateId: "alpha" | "beta";

const hasAlpha = monitorIds.has("alpha");
const hasCandidate = monitorIds.has(candidateId);
const typedHasCandidate = setHas(monitorIds, candidateId);

if (hasAlpha && (hasCandidate || typedHasCandidate)) {
    throw new TypeError("Unexpected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
