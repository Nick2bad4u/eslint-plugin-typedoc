declare function isSafeInteger(value: unknown): value is number;

const maybeMonitorCount: unknown = 12;
if (isSafeInteger(maybeMonitorCount)) {
    const totalCount = maybeMonitorCount + 1;
    if (totalCount > 1000) {
        throw new TypeError("Unexpectedly large monitor count");
    }
}

export const typedFixtureModule = "typed-fixture-module";
