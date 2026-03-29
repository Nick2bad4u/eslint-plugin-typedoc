declare function objectFromEntries<TKey extends PropertyKey, TValue>(
    entries: Iterable<readonly [TKey, TValue]>
): Record<TKey, TValue>;

const statusEntries = [
    ["api", 200],
    ["dashboard", 500],
] as const;

const statusByName = objectFromEntries(statusEntries);

if (statusByName.api === statusByName.dashboard) {
    throw new TypeError("Unexpected status entry mapping");
}

export const typedFixtureModule = "typed-fixture-module";
