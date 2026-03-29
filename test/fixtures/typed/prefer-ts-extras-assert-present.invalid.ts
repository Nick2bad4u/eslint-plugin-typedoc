declare function assertPresent<TValue>(
    value: TValue
): asserts value is NonNullable<TValue>;

declare const firstMonitorId: null | string | undefined;
declare const secondMonitorId: null | string | undefined;

if (firstMonitorId === null || firstMonitorId === undefined) {
    throw new TypeError("first monitor id required");
}

if (secondMonitorId === null || secondMonitorId === undefined) {
    throw new TypeError("second monitor id required");
}

assertPresent(firstMonitorId);

export const typedFixtureModule = "typed-fixture-module";
