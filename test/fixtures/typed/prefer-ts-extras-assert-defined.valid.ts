declare function assertDefined<TValue>(
    value: TValue | undefined
): asserts value is TValue;

declare const firstMonitorId: string | undefined;
declare const secondMonitorId: string | undefined;

assertDefined(firstMonitorId);
assertDefined(secondMonitorId);

export const typedFixtureModule = "typed-fixture-module";
