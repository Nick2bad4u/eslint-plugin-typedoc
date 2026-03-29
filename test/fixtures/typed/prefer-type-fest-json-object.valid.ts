import type { JsonObject } from "type-fest";

type MonitorJsonShape = JsonObject;
type MonitorJsonShapeViaRecord = JsonObject;

declare function useMonitorJson(value: MonitorJsonShape): void;
declare function useMonitorJsonRecord(value: MonitorJsonShapeViaRecord): void;

useMonitorJson({ healthy: true, id: "alpha" });
useMonitorJsonRecord({ healthy: false, id: "beta" });

export const typedFixtureModule = "typed-fixture-module";
