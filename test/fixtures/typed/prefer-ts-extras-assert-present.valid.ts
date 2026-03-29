declare function assertPresent<TValue>(
    value: TValue
): asserts value is NonNullable<TValue>;

declare const firstMonitorId: null | string | undefined;
declare const secondMonitorId: null | string | undefined;

assertPresent(firstMonitorId);
assertPresent(secondMonitorId);

export const typedFixtureModule = "typed-fixture-module";
