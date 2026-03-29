declare function isInteger(value: unknown): value is number;

const maybeRetryCount: unknown = 3;
if (isInteger(maybeRetryCount)) {
    const nextRetryCount = maybeRetryCount + 1;
    if (nextRetryCount > 1000) {
        throw new TypeError("Unexpectedly large retry count");
    }
}

export const typedFixtureModule = "typed-fixture-module";
