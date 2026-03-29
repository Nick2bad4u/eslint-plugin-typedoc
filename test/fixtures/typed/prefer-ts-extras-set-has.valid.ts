declare function setHas<TValue>(
    set: ReadonlySet<TValue>,
    value: unknown
): value is TValue;

const monitorIds = new Set(["alpha", "beta"] as const);

declare const candidateId: string;

const hasMonitor = setHas(monitorIds, candidateId);

if (hasMonitor && candidateId === "alpha") {
    throw new TypeError("Unexpected monitor id in fixture");
}

export const typedFixtureModule = "typed-fixture-module";
