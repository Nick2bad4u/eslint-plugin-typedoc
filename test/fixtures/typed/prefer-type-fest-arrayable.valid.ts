import type { Arrayable } from "type-fest";

type LatencySample = Arrayable<number>;
type MonitorIdOrList = Arrayable<string>;

declare function addLatencySample(value: LatencySample): void;
declare function addMonitorId(value: MonitorIdOrList): void;

addMonitorId("monitor-alpha");
addLatencySample(42);

export const typedFixtureModule = "typed-fixture-module";
