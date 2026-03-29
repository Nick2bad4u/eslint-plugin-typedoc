declare function assertDefined<TValue>(
    value: TValue | undefined
): asserts value is TValue;

declare const firstMonitorId: string | undefined;
declare const secondMonitorId: string | undefined;

if (firstMonitorId === undefined) {
    throw new TypeError("first monitor id required");
}

if (undefined === secondMonitorId) {
    throw new TypeError("second monitor id required");
}

assertDefined(firstMonitorId);

export const typedFixtureModule = "typed-fixture-module";
