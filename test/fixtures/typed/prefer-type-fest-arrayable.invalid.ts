type LatencySample = Array<number> | number;
type MonitorIdOrList = string | string[];

declare function addLatencySample(value: LatencySample): void;
declare function addMonitorId(value: MonitorIdOrList): void;

addMonitorId("monitor-alpha");
addLatencySample(42);

export const typedFixtureModule = "typed-fixture-module";
