import type { JsonValue } from "type-fest";

type MonitorJsonShape = Record<string, JsonValue>;
type MonitorJsonShapeViaRecord = Record<string, JsonValue>;

declare function useMonitorJson(value: MonitorJsonShape): void;
declare function useMonitorJsonRecord(value: MonitorJsonShapeViaRecord): void;

useMonitorJson({ healthy: true, id: "alpha" });
useMonitorJsonRecord({ healthy: false, id: "beta" });

export const typedFixtureModule = "typed-fixture-module";
