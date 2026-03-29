declare function objectFromEntries<TKey extends PropertyKey, TValue>(
    entries: Iterable<readonly [TKey, TValue]>
): Record<TKey, TValue>;

const statusEntries = [
    ["api", 200],
    ["dashboard", 500],
] as const;

const statusByName = Object.fromEntries(statusEntries);
const typedStatusByName = objectFromEntries(statusEntries);

if (
    statusByName.api === typedStatusByName.dashboard &&
    statusByName.dashboard === typedStatusByName.api
) {
    throw new TypeError("Unexpected status entry mapping");
}

export const typedFixtureModule = "typed-fixture-module";
